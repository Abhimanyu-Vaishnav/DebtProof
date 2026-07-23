"""
DebtProof — Automation Engine Models
IF/THEN rule engine for automated financial workflows.
"""
from django.db import models
from django.utils import timezone
from apps.core.models import BaseModel
from apps.users.models import User


class ConditionType(models.TextChoices):
    EMI_DUE_IN_DAYS = "emi_due_in_days", "EMI Due in N Days"
    LOAN_OVERDUE = "loan_overdue", "Loan Becomes Overdue"
    BUDGET_EXCEEDED = "budget_exceeded", "Budget Exceeds Limit"
    INVESTMENT_DROP = "investment_drop", "Investment Drops by N%"
    CARD_UTILIZATION_HIGH = "card_utilization_high", "Credit Card Utilization Exceeds N%"
    PAYMENT_DUE = "payment_due", "Payment Due Date Approaching"


class ActionType(models.TextChoices):
    SEND_NOTIFICATION = "send_notification", "Send In-App Notification"
    SEND_EMAIL = "send_email", "Send Email"
    SHOW_WARNING = "show_warning", "Show Dashboard Warning"
    RECOMMEND_PAYMENT = "recommend_payment", "Recommend Payment Action"


class Priority(models.IntegerChoices):
    LOW = 1, "Low"
    MEDIUM = 2, "Medium"
    HIGH = 3, "High"
    CRITICAL = 4, "Critical"


class AutomationRule(BaseModel):
    """
    A user-defined IF/THEN automation rule.
    e.g., IF EMI due in 3 days THEN Send Notification.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="automation_rules")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    # IF part
    condition_type = models.CharField(max_length=50, choices=ConditionType.choices)
    condition_value = models.JSONField(default=dict, help_text="e.g. {'days': 3} or {'threshold': 70}")

    # THEN part
    action_type = models.CharField(max_length=50, choices=ActionType.choices)
    action_config = models.JSONField(default=dict, help_text="e.g. {'message': 'Your EMI is due soon!'}")

    priority = models.IntegerField(choices=Priority.choices, default=Priority.MEDIUM)
    is_enabled = models.BooleanField(default=True)
    last_triggered_at = models.DateTimeField(null=True, blank=True)
    trigger_count = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "automation_rules"
        ordering = ["-priority", "-created_at"]

    def __str__(self):
        return f"[{self.user.email}] {self.name}"


class AutomationExecutionLog(BaseModel):
    """
    Immutable record of each automation rule execution.
    """
    rule = models.ForeignKey(AutomationRule, on_delete=models.CASCADE, related_name="execution_logs")
    status = models.CharField(max_length=20, choices=[
        ("success", "Success"),
        ("failed", "Failed"),
        ("skipped", "Skipped"),
    ], default="success")
    triggered_at = models.DateTimeField(default=timezone.now)
    details = models.TextField(blank=True)
    context_data = models.JSONField(default=dict)

    class Meta:
        db_table = "automation_execution_logs"
        ordering = ["-triggered_at"]

    def __str__(self):
        return f"[{self.status}] {self.rule.name} @ {self.triggered_at}"
