"""
DebtProof — AI Engine Models
Real-data financial AI assistant with conversation history and settings.
"""
from django.db import models
from apps.core.models import BaseModel
from apps.users.models import User


class UserAISettings(BaseModel):
    """Per-user AI assistant configuration."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="ai_settings")
    is_enabled = models.BooleanField(default=True)
    monthly_query_limit = models.PositiveIntegerField(default=100)
    queries_used_this_month = models.PositiveIntegerField(default=0)
    preferred_language = models.CharField(max_length=10, default="en")
    response_style = models.CharField(
        max_length=20,
        choices=[("concise", "Concise"), ("detailed", "Detailed"), ("conversational", "Conversational")],
        default="conversational",
    )
    privacy_mode = models.BooleanField(default=False, help_text="Anonymize data in AI responses")

    class Meta:
        db_table = "user_ai_settings"

    def __str__(self):
        return f"AI Settings — {self.user.email}"


class AIConversation(BaseModel):
    """A chat session with the AI financial assistant."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ai_conversations")
    title = models.CharField(max_length=200, default="New Conversation")
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "ai_conversations"
        ordering = ["-created_at"]


class AIMessage(BaseModel):
    """A single message in an AI conversation."""
    ROLE_CHOICES = [("user", "User"), ("assistant", "Assistant")]

    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    tokens_used = models.PositiveIntegerField(default=0)
    calculation_context = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "ai_messages"
        ordering = ["created_at"]


class ActivityTimelineEntry(BaseModel):
    """Unified activity timeline — logs every significant user action."""
    EVENT_TYPES = [
        ("loan_created", "Loan Created"),
        ("loan_updated", "Loan Updated"),
        ("loan_closed", "Loan Closed"),
        ("payment_added", "Payment Added"),
        ("receipt_uploaded", "Receipt Uploaded"),
        ("invitation_sent", "Invitation Sent"),
        ("invitation_accepted", "Invitation Accepted"),
        ("plan_changed", "Plan Changed"),
        ("feature_enabled", "Feature Flag Enabled"),
        ("feature_disabled", "Feature Flag Disabled"),
        ("ai_insight", "AI Insight Generated"),
        ("automation_triggered", "Automation Rule Triggered"),
        ("report_generated", "Report Generated"),
        ("profile_updated", "Profile Updated"),
        ("login", "User Login"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="activity_timeline")
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict)
    icon = models.CharField(max_length=10, default="📋")
    color = models.CharField(max_length=20, default="blue")

    class Meta:
        db_table = "activity_timeline"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.user.email}] {self.event_type}: {self.title}"
