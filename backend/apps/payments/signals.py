"""
DebtProof — Payment Signals
Auto-recalculate loan outstanding_amount whenever a payment is saved or deleted.
"""
import logging
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum
from apps.payments.models import Payment, PaymentStatus

logger = logging.getLogger(__name__)


def _recalculate_outstanding(loan) -> None:
    """
    Recomputes outstanding_amount as:
        principal_amount - sum(confirmed payments' principal components)

    If a payment has both components as 0.00, it auto-computes the interest and
    principal breakdown chronologically using the running outstanding balance.

    Also auto-closes a loan if outstanding reaches zero.
    """
    from apps.loans.models import LoanStatus
    from decimal import Decimal

    payments = Payment.objects.filter(
        loan=loan, 
        status=PaymentStatus.CONFIRMED
    ).order_by("payment_date", "created_at")

    running_outstanding = loan.principal_amount

    for payment in payments:
        # Auto-compute breakdown if both are 0.00
        if payment.principal_component == Decimal("0.00") and payment.interest_component == Decimal("0.00"):
            # interest = (running_outstanding * interest_rate) / (12 * 100)
            interest = (running_outstanding * loan.interest_rate) / Decimal("1200.00")
            if interest > payment.amount:
                interest = payment.amount
            principal = payment.amount - interest

            interest_val = interest.quantize(Decimal("0.01"))
            principal_val = principal.quantize(Decimal("0.01"))

            # Update database directly to avoid triggering post_save recursion loop
            Payment.objects.filter(id=payment.id).update(
                interest_component=interest_val,
                principal_component=principal_val
            )
            # Update local instance fields so the loop below uses updated values
            payment.interest_component = interest_val
            payment.principal_component = principal_val

        # Deduct only the principal component from the outstanding balance
        running_outstanding -= payment.principal_component

    # Clamp to zero (safety net)
    if running_outstanding < 0:
        running_outstanding = Decimal("0.00")

    # Auto-close if fully repaid and currently active
    new_status = loan.status
    if running_outstanding == 0 and loan.status == LoanStatus.ACTIVE:
        new_status = LoanStatus.CLOSED
        logger.info("Loan %s auto-closed — fully repaid.", loan.name)

    # Only write if something changed (avoid unnecessary DB writes)
    if loan.outstanding_amount != running_outstanding or loan.status != new_status:
        loan.outstanding_amount = running_outstanding
        loan.status = new_status
        loan.save(update_fields=["outstanding_amount", "status", "updated_at"])
        logger.debug(
            "Loan %s outstanding updated: %s -> %s",
            loan.name,
            loan.outstanding_amount,
            running_outstanding,
        )


@receiver(post_save, sender=Payment)
def on_payment_saved(sender, instance: Payment, created: bool, **kwargs) -> None:
    """Recalculate loan outstanding and record activity entry after any payment save."""
    _recalculate_outstanding(instance.loan)
    if created:
        try:
            from apps.ai_engine.models import ActivityTimelineEntry
            lender = instance.loan.lender_name if instance.loan else "Loan"
            ActivityTimelineEntry.objects.create(
                user=instance.loan.user if instance.loan else None,
                event_type="payment_added",
                title=f"Payment Recorded: ₹{instance.amount:,.0f}",
                description=f"Paid for {lender} on {instance.payment_date or 'today'}",
                icon="💸",
                color="green",
            )
        except Exception as e:
            logger.error("Failed to log payment activity entry: %s", e)


@receiver(post_delete, sender=Payment)
def on_payment_deleted(sender, instance: Payment, **kwargs) -> None:
    """Recalculate loan outstanding after a payment is deleted."""
    _recalculate_outstanding(instance.loan)
