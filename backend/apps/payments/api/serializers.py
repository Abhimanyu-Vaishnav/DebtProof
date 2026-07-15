"""
DebtProof — Payment & Receipt API Serializers
"""
from decimal import Decimal
from rest_framework import serializers
from apps.payments.models import Payment, Receipt, PaymentStatus
from apps.loans.models import Loan


class ReceiptSerializer(serializers.ModelSerializer):
    """Serializer for receipt records."""

    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Receipt
        fields = [
            "id",
            "original_filename",
            "file_size_bytes",
            "mime_type",
            "document_hash",
            "hash_algorithm",
            "file_url",
            "created_at",
        ]
        read_only_fields = fields

    def get_file_url(self, obj: Receipt) -> str | None:
        request = self.context.get("request")
        if obj.document and request:
            return request.build_absolute_uri(obj.document.url)
        return None


class PaymentListSerializer(serializers.ModelSerializer):
    """Lightweight payment serializer for lists."""

    loan_name = serializers.CharField(source="loan.name", read_only=True)
    has_receipt = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            "id",
            "loan",
            "loan_name",
            "amount",
            "payment_date",
            "payment_method",
            "reference_number",
            "status",
            "has_receipt",
            "created_at",
        ]
        read_only_fields = fields

    def get_has_receipt(self, obj: Payment) -> bool:
        return hasattr(obj, "receipt") and obj.receipt is not None


class PaymentSerializer(serializers.ModelSerializer):
    """Full payment serializer with nested receipt."""

    receipt = ReceiptSerializer(read_only=True)
    loan_name = serializers.CharField(source="loan.name", read_only=True)
    has_receipt = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            "id",
            "loan",
            "loan_name",
            "amount",
            "payment_date",
            "payment_method",
            "reference_number",
            "status",
            "principal_component",
            "interest_component",
            "notes",
            "receipt",
            "has_receipt",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "loan_name",
            "receipt",
            "has_receipt",
            "created_at",
            "updated_at",
        ]

    def get_has_receipt(self, obj: Payment) -> bool:
        return hasattr(obj, "receipt") and obj.receipt is not None

    def validate_amount(self, value: Decimal) -> Decimal:
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be greater than zero.")
        return value

    def validate(self, attrs: dict) -> dict:
        loan: Loan = attrs.get("loan") or (self.instance.loan if self.instance else None)
        amount: Decimal = attrs.get("amount") or (self.instance.amount if self.instance else None)

        if loan and amount:
            # Don't validate on update if amount didn't change
            is_new = self.instance is None
            if is_new and amount > loan.outstanding_amount:
                raise serializers.ValidationError(
                    {"amount": f"Payment amount (₹{amount}) cannot exceed outstanding balance (₹{loan.outstanding_amount})."}
                )

        return attrs


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a payment within a specific loan context."""

    class Meta:
        model = Payment
        fields = [
            "amount",
            "payment_date",
            "payment_method",
            "reference_number",
            "status",
            "principal_component",
            "interest_component",
            "notes",
        ]

    def validate_amount(self, value: Decimal) -> Decimal:
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be greater than zero.")
        return value

    def validate(self, attrs: dict) -> dict:
        loan: Loan = self.context.get("loan")
        amount: Decimal = attrs.get("amount")

        if loan and amount:
            if amount > loan.outstanding_amount:
                raise serializers.ValidationError(
                    {"amount": f"Payment amount (₹{amount}) cannot exceed outstanding balance (₹{loan.outstanding_amount})."}
                )

        return attrs

    def create(self, validated_data: dict) -> Payment:
        loan = self.context["loan"]
        validated_data["loan"] = loan
        return super().create(validated_data)


class ReceiptUploadSerializer(serializers.Serializer):
    """Serializer for receipt file upload."""

    file = serializers.FileField()

    def validate_file(self, value):
        allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
        allowed_extensions = [".pdf", ".jpg", ".jpeg", ".png"]
        import os
        ext = os.path.splitext(value.name)[1].lower()

        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"Unsupported file type. Allowed: PDF, JPG, PNG."
            )

        max_size = 5 * 1024 * 1024  # 5MB
        if value.size > max_size:
            raise serializers.ValidationError("File size cannot exceed 5MB.")

        return value
