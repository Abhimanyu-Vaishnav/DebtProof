"""
DebtProof — Credit Card Serializer
"""
from rest_framework import serializers
from apps.credit_cards.models import CreditCard


class CreditCardSerializer(serializers.ModelSerializer):
    utilization_rate = serializers.ReadOnlyField()
    available_limit = serializers.ReadOnlyField()

    class Meta:
        model = CreditCard
        fields = [
            "id",
            "card_name",
            "bank_name",
            "credit_limit",
            "current_outstanding",
            "interest_rate",
            "minimum_due",
            "statement_date",
            "due_date",
            "status",
            "notes",
            "utilization_rate",
            "available_limit",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, data):
        limit = data.get("credit_limit")
        outstanding = data.get("current_outstanding")
        
        # When updating, if they aren't provided, use existing
        if limit is None and self.instance:
            limit = self.instance.credit_limit
        if outstanding is None and self.instance:
            outstanding = self.instance.current_outstanding

        if limit is not None and outstanding is not None:
            if outstanding > limit:
                raise serializers.ValidationError(
                    {"current_outstanding": "Current outstanding balance cannot exceed the credit limit."}
                )
        return data
