"""
DebtProof — Notification Signals
Auto-create a payment_received notification whenever a confirmed payment is saved.
"""
import logging
from django.db.models.signals import post_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)


@receiver(post_save, sender="payments.Payment")
def on_payment_confirmed(sender, instance, created: bool, **kwargs) -> None:
    """
    When a confirmed payment is created → create a payment_received notification.
    Uses string reference for sender to avoid circular import.
    """
    from apps.payments.models import PaymentStatus
    from apps.notifications.models import Notification, NotificationType
    from decimal import Decimal

    if instance.status != PaymentStatus.CONFIRMED:
        return

    dedup_key = f"payment_received-{instance.id}"
    if Notification.objects.filter(dedup_key=dedup_key).exists():
        return  # Already notified for this payment

    loan = instance.loan
    amount = Decimal(str(instance.amount))
    outstanding = Decimal(str(loan.outstanding_amount))
    Notification.objects.create(
        user=loan.user,
        title="Payment Recorded ✓",
        body=(
            f"₹{amount:,.2f} payment for <b>{loan.name}</b> has been recorded successfully. "
            f"Outstanding balance: ₹{outstanding:,.2f}."
        ),
        notif_type=NotificationType.PAYMENT_RECEIVED,
        loan=loan,
        dedup_key=dedup_key,
    )
    logger.info("payment_received notification created for loan %s", loan.name)



@receiver(post_save, sender="loans.Loan")
def on_loan_status_change(sender, instance, created: bool, **kwargs) -> None:
    """
    When a loan transitions to CLOSED → create a loan_closed notification.
    """
    from apps.loans.models import LoanStatus
    from apps.notifications.models import Notification, NotificationType

    if instance.status != LoanStatus.CLOSED:
        return

    dedup_key = f"loan_closed-{instance.id}"
    if Notification.objects.filter(dedup_key=dedup_key).exists():
        return

    Notification.objects.create(
        user=instance.user,
        title="🎉 Loan Fully Repaid!",
        body=(
            f"Congratulations! Your loan <b>{instance.name}</b> with {instance.lender_name} "
            f"has been fully repaid. It has been marked as Closed."
        ),
        notif_type=NotificationType.LOAN_CLOSED,
        loan=instance,
        dedup_key=dedup_key,
    )
    logger.info("loan_closed notification created for loan %s", instance.name)
