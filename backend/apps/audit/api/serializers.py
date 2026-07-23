"""
DebtProof — Audit Log Serializers
"""
from rest_framework import serializers
from apps.audit.models import AuditLog
from apps.users.models import User


class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "user",
            "user_email",
            "organization_id",
            "workspace_id",
            "action",
            "target_resource",
            "ip_address",
            "user_agent",
            "metadata_json",
            "created_at",
        ]

    def get_user_email(self, obj: AuditLog) -> str:
        return obj.user.email if obj.user else "System"
