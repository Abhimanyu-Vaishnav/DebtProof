"""
DebtProof — Audit Log Models
Immutable system audit logging for compliance and activity tracking.
"""
from django.db import models
from apps.core.models import BaseModel
from apps.users.models import User


class AuditAction(models.TextChoices):
    """Categorized audit actions."""
    LOGIN = "login", "User Login"
    LOGOUT = "logout", "User Logout"
    LOAN_CREATED = "loan_created", "Loan Created"
    LOAN_UPDATED = "loan_updated", "Loan Updated"
    LOAN_DELETED = "loan_deleted", "Loan Deleted"
    PAYMENT_RECORDED = "payment_recorded", "Payment Recorded"
    RECEIPT_UPLOADED = "receipt_uploaded", "Receipt Uploaded"
    PROOF_GENERATED = "proof_generated", "Proof Generated"
    INVITATION_SENT = "invitation_sent", "Invitation Sent"
    INVITATION_ACCEPTED = "invitation_accepted", "Invitation Accepted"
    INVITATION_REJECTED = "invitation_rejected", "Invitation Rejected"
    ROLE_CHANGED = "role_changed", "Role Changed"
    FEATURE_FLAG_TOGGLED = "feature_flag_toggled", "Feature Flag Toggled"
    PLAN_CHANGED = "plan_changed", "Subscription Plan Changed"
    SETTING_UPDATED = "setting_updated", "Setting Updated"


class AuditLog(BaseModel):
    """
    Immutable activity record tracking actions across tenant organizations and workspaces.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
        db_index=True,
    )
    organization_id = models.UUIDField(null=True, blank=True, db_index=True)
    workspace_id = models.UUIDField(null=True, blank=True, db_index=True)

    action = models.CharField(
        max_length=50,
        choices=AuditAction.choices,
        db_index=True,
    )
    target_resource = models.CharField(max_length=255, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "audit_logs"
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization_id", "created_at"]),
            models.Index(fields=["workspace_id", "created_at"]),
            models.Index(fields=["action", "created_at"]),
        ]

    def __str__(self) -> str:
        actor = self.user.email if self.user else "System"
        return f"[{self.created_at}] {actor} — {self.get_action_display()}"
