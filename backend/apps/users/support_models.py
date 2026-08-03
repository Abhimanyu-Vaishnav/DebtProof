"""
DebtProof — Multilayer Support & Ticket Chat Models
Database models for Ticket Chat, Tiered Escalation (Support -> Manager -> Admin), and Admin Feature Flags for Support Staff.
"""
from django.db import models
from apps.core.models import BaseModel
from apps.users.models import User, StaffProfile, SupportTicket


class TicketChatMessage(BaseModel):
  """
  Real-time chat messages exchanged inside a Support Ticket.
  Can be sent by User, Customer Support Staff, Admin Manager, or SuperAdmin.
  """

  ticket = models.ForeignKey(
      SupportTicket,
      on_delete=models.CASCADE,
      related_name="chat_messages",
      db_index=True,
  )
  sender = models.ForeignKey(
      User,
      on_delete=models.SET_NULL,
      null=True,
      related_name="ticket_chat_messages",
  )
  sender_role = models.CharField(
      max_length=30, default="user"
  )  # user, customer_support, manager, admin
  message = models.TextField()
  attachment_url = models.URLField(blank=True, null=True)
  is_internal_note = models.BooleanField(
      default=False,
      help_text="Visible only to Support Staff, Managers, and Admin",
  )

  class Meta:
    db_table = "ticket_chat_messages"
    verbose_name = "Ticket Chat Message"
    verbose_name_plural = "Ticket Chat Messages"
    ordering = ["created_at"]

  def __str__(self) -> str:
    return (
        f"Ticket #{self.ticket.id[:8]} - {self.sender_role}: {self.message[:30]}"
    )


class TicketEscalationLog(BaseModel):
  """
  Tracks ticket escalation hierarchy (CustomerSupport -> AdminManager -> SuperAdmin).
  """

  ticket = models.ForeignKey(
      SupportTicket, on_delete=models.CASCADE, related_name="escalation_logs"
  )
  escalated_by = models.ForeignKey(
      User, on_delete=models.SET_NULL, null=True, related_name="escalations_made"
  )
  from_tier = models.CharField(max_length=30)  # CustomerSupport
  to_tier = models.CharField(max_length=30)  # AdminManager or SuperAdmin
  reason = models.TextField()
  requires_account_mutation = models.BooleanField(
      default=False,
      help_text="True if escalation requests loan/payment record modification",
  )

  class Meta:
    db_table = "ticket_escalation_logs"
    verbose_name = "Ticket Escalation Log"
    verbose_name_plural = "Ticket Escalation Logs"
    ordering = ["-created_at"]


class SupportDashboardConfig(BaseModel):
  """
  Admin-controlled configuration for what features Customer Support agents can access.
  Controlled dynamically from Admin Dashboard.
  """

  staff_profile = models.OneToOneField(
      StaffProfile, on_delete=models.CASCADE, related_name="dashboard_config"
  )
  can_view_user_loans = models.BooleanField(default=True)
  can_view_user_payments = models.BooleanField(default=True)
  can_view_user_credit_cards = models.BooleanField(default=True)
  can_edit_user_account = models.BooleanField(
      default=False,
      help_text="Allow direct modification or correction of user records",
  )
  can_escalate_to_manager = models.BooleanField(default=True)
  can_escalate_to_admin = models.BooleanField(default=False)
  can_refund_or_settle = models.BooleanField(default=False)
  allowed_modules = models.JSONField(
      default=list,
      help_text="List of visible feature modules e.g. ['loans', 'tickets', 'chat']",
  )

  class Meta:
    db_table = "support_dashboard_configs"
    verbose_name = "Support Dashboard Config"
    verbose_name_plural = "Support Dashboard Configs"
