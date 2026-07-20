"""
DebtProof — Loan API Serializers
Production-ready serializers with full validation.
"""
from decimal import Decimal
from datetime import date
from rest_framework import serializers
from apps.loans.models import Loan, LoanType, LoanStatus


class LoanListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing loans (less data transferred)."""

    paid_amount = serializers.SerializerMethodField()
    interest_paid = serializers.SerializerMethodField()
    repayment_progress_percent = serializers.SerializerMethodField()
    total_payments = serializers.SerializerMethodField()

    class Meta:
        model = Loan
        fields = [
            "id",
            "name",
            "loan_type",
            "lender_name",
            "principal_amount",
            "outstanding_amount",
            "paid_amount",
            "interest_paid",
            "interest_rate",
            "monthly_emi",
            "start_date",
            "end_date",
            "next_emi_date",
            "status",
            "repayment_progress_percent",
            "total_payments",
            "is_escrow",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_paid_amount(self, obj: Loan) -> str:
        return str(obj.paid_amount)

    def get_interest_paid(self, obj: Loan) -> str:
        return str(obj.interest_paid)

    def get_repayment_progress_percent(self, obj: Loan) -> float:
        return round(obj.repayment_progress_percent, 2)

    def get_total_payments(self, obj: Loan) -> int:
        return obj.payments.filter(status="confirmed").count()


class LoanSerializer(serializers.ModelSerializer):
    """Full serializer for loan detail and creation/update."""

    paid_amount = serializers.SerializerMethodField()
    interest_paid = serializers.SerializerMethodField()
    repayment_progress_percent = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()
    total_payments = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Loan
        fields = [
            "id",
            "name",
            "loan_type",
            "lender_name",
            "account_number",
            "principal_amount",
            "outstanding_amount",
            "paid_amount",
            "interest_paid",
            "interest_rate",
            "monthly_emi",
            "start_date",
            "end_date",
            "next_emi_date",
            "status",
            "notes",
            "repayment_progress_percent",
            "is_active",
            "is_overdue",
            "total_payments",
            "is_escrow",
            "borrower_wallet",
            "lender_wallet",
            "escrow_contract_address",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "outstanding_amount",
            "paid_amount",
            "interest_paid",
            "repayment_progress_percent",
            "is_active",
            "is_overdue",
            "total_payments",
            "is_escrow",
            "borrower_wallet",
            "lender_wallet",
            "escrow_contract_address",
            "created_at",
            "updated_at",
        ]

    def get_paid_amount(self, obj: Loan) -> str:
        return str(obj.paid_amount)

    def get_interest_paid(self, obj: Loan) -> str:
        return str(obj.interest_paid)

    def get_repayment_progress_percent(self, obj: Loan) -> float:
        return round(obj.repayment_progress_percent, 2)

    def get_is_active(self, obj: Loan) -> bool:
        return obj.is_active

    def get_total_payments(self, obj: Loan) -> int:
        return obj.payments.filter(status="confirmed").count()

    def get_is_overdue(self, obj: Loan) -> bool:
        if obj.status != LoanStatus.ACTIVE:
            return False
        if obj.next_emi_date and obj.next_emi_date < date.today():
            return True
        return False

    def validate_principal_amount(self, value: Decimal) -> Decimal:
        if value <= 0:
            raise serializers.ValidationError("Principal amount must be greater than zero.")
        return value

    def validate_monthly_emi(self, value: Decimal) -> Decimal:
        if value <= 0:
            raise serializers.ValidationError("EMI amount must be greater than zero.")
        return value

    def validate_interest_rate(self, value: Decimal) -> Decimal:
        if value < 0:
            raise serializers.ValidationError("Interest rate cannot be negative.")
        if value > 100:
            raise serializers.ValidationError("Interest rate cannot exceed 100%.")
        return value

    def validate(self, attrs: dict) -> dict:
        start_date = attrs.get("start_date") or (self.instance.start_date if self.instance else None)
        end_date = attrs.get("end_date") or (self.instance.end_date if self.instance else None)

        if start_date and end_date and end_date <= start_date:
            raise serializers.ValidationError(
                {"end_date": "End date must be after start date."}
            )

        return attrs

    def create(self, validated_data: dict) -> Loan:
        validated_data["user"] = self.context["request"].user
        # Initialize outstanding_amount to principal_amount on creation
        validated_data["outstanding_amount"] = validated_data["principal_amount"]
        return super().create(validated_data)
