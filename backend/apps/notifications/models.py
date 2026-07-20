"""
DebtProof — Notification Model
Backend-driven notification system for EMI events and payment alerts.
"""
from django.db import models
from apps.core.models import BaseModel
from apps.users.models import User


class NotificationType(models.TextChoices):
    EMI_UPCOMING = "emi_upcoming", "EMI Upcoming"
    EMI_OVERDUE = "emi_overdue", "EMI Overdue"
    PAYMENT_RECEIVED = "payment_received", "Payment Received"
    LOAN_CLOSED = "loan_closed", "Loan Closed"
    INFO = "info", "Info"


class Notification(BaseModel):
    """
    A notification for a user.

    - Notification is created by signals (payment) or management command (EMI schedule).
    - `loan` is nullable — some notifications (INFO) are not linked to a specific loan.
    - `dedup_key` ensures the same notification is not duplicated
      (e.g., one EMI_OVERDUE per loan per day).
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
        db_index=True,
    )
    title = models.CharField(max_length=200)
    body = models.TextField()
    notif_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.INFO,
        db_index=True,
    )
    loan = models.ForeignKey(
        "loans.Loan",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )
    is_read = models.BooleanField(default=False, db_index=True)
    # Dedup key: e.g. "emi_overdue-<loan_id>-2026-07-20" — prevents duplicate alerts per day
    dedup_key = models.CharField(max_length=200, blank=True, db_index=True)

    class Meta:
        db_table = "notifications"
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "is_read"]),
            models.Index(fields=["user", "notif_type"]),
        ]

    def __str__(self) -> str:
        return f"[{self.notif_type}] {self.title} → {self.user.email}"
