"""
DebtProof — Notification Serializers
"""
from rest_framework import serializers
from apps.notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    loan_name = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "body",
            "notif_type",
            "loan",
            "loan_name",
            "is_read",
            "created_at",
        ]
        read_only_fields = fields

    def get_loan_name(self, obj) -> str | None:
        return obj.loan.name if obj.loan else None
