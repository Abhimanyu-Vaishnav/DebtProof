"""
DebtProof — Automation Rule Execution Engine
Evaluates IF conditions against live DB data and fires THEN actions.
"""
import logging
from django.utils import timezone
from decimal import Decimal

logger = logging.getLogger(__name__)


def evaluate_and_execute_rule(rule, force: bool = False) -> dict:
    """
    Evaluate a single AutomationRule condition against live DB data.
    If condition is met (or force=True), execute the action.
    Returns a result dict.
    """
    from apps.automation.models import AutomationExecutionLog
    from apps.notifications.models import Notification, NotificationType

    user = rule.user
    context = {}
    condition_met = force

    try:
        condition_met = _evaluate_condition(rule, user, context) or force
    except Exception as e:
        logger.error("Condition evaluation error for rule %s: %s", rule.id, e)
        AutomationExecutionLog.objects.create(
            rule=rule, status="failed",
            details=f"Condition evaluation failed: {e}",
            context_data=context,
        )
        return {"status": "failed", "message": str(e)}

    if not condition_met:
        AutomationExecutionLog.objects.create(
            rule=rule, status="skipped",
            details="Condition not met.",
            context_data=context,
        )
        return {"status": "skipped", "message": "Condition not met."}

    # Execute Action
    try:
        _execute_action(rule, user, context)
        rule.last_triggered_at = timezone.now()
        rule.trigger_count += 1
        rule.save(update_fields=["last_triggered_at", "trigger_count"])

        AutomationExecutionLog.objects.create(
            rule=rule, status="success",
            details=f"Action '{rule.action_type}' executed successfully.",
            context_data=context,
        )
        try:
            from apps.ai_engine.models import ActivityTimelineEntry
            ActivityTimelineEntry.objects.create(
                user=user,
                event_type="automation_triggered",
                title=f"Automation Fired: {rule.name}",
                description=f"Action '{rule.action_type}' executed for rule context.",
                icon="⚡",
                color="amber",
            )
        except Exception:
            pass
        return {"status": "success", "message": f"Action '{rule.action_type}' executed.", "context": context}
    except Exception as e:
        logger.error("Action execution error for rule %s: %s", rule.id, e)
        AutomationExecutionLog.objects.create(
            rule=rule, status="failed",
            details=f"Action execution failed: {e}",
            context_data=context,
        )
        return {"status": "failed", "message": str(e)}


def _evaluate_condition(rule, user, context: dict) -> bool:
    """Evaluate the rule's IF condition against live database data."""
    from apps.loans.models import Loan
    from apps.payments.models import Payment

    ctype = rule.condition_type
    cval = rule.condition_value

    if ctype == "emi_due_in_days":
        days = int(cval.get("days", 3))
        from datetime import date, timedelta
        target_date = date.today() + timedelta(days=days)
        active_loans = Loan.objects.filter(user=user, status="active")
        due_loans = [l for l in active_loans if l.next_emi_date and l.next_emi_date <= target_date]
        context["due_loans_count"] = len(due_loans)
        context["due_loans"] = [str(l.id) for l in due_loans]
        return len(due_loans) > 0

    elif ctype == "loan_overdue":
        from datetime import date
        overdue_loans = Loan.objects.filter(user=user, status="active",
                                            next_emi_date__lt=date.today())
        context["overdue_count"] = overdue_loans.count()
        return overdue_loans.exists()

    elif ctype == "card_utilization_high":
        from apps.credit_cards.models import CreditCard
        threshold = Decimal(str(cval.get("threshold", 70)))
        cards = CreditCard.objects.filter(user=user)
        high_util_cards = []
        for card in cards:
            if card.credit_limit and card.credit_limit > 0:
                utilization = (card.current_balance / card.credit_limit) * 100
                if utilization >= threshold:
                    high_util_cards.append({"card": str(card.id), "utilization": float(utilization)})
        context["high_utilization_cards"] = high_util_cards
        return len(high_util_cards) > 0

    elif ctype == "budget_exceeded":
        # Placeholder — budget app will connect here when implemented
        return False

    elif ctype == "investment_drop":
        return False

    return False


def _execute_action(rule, user, context: dict):
    """Execute the THEN action of a rule."""
    from apps.notifications.models import Notification, NotificationType

    atype = rule.action_type
    aconf = rule.action_config
    msg = aconf.get("message") or f"Automation rule '{rule.name}' triggered."

    if atype in ("send_notification", "show_warning", "recommend_payment"):
        dedup = f"automation-{rule.id}-{timezone.now().timestamp()}"
        Notification.objects.create(
            user=user,
            title=f"⚡ Automation Alert: {rule.name}",
            body=msg,
            notif_type=NotificationType.INFO,
            dedup_key=dedup,
        )

    elif atype == "send_email":
        # Email sending placeholder — wire up SMTP/SendGrid in production
        logger.info("Email action triggered for user %s: %s", user.email, msg)
