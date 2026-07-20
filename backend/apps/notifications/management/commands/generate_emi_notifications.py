"""
DebtProof — Generate EMI Notifications Management Command

Usage:
    python manage.py generate_emi_notifications

Run this daily (via cron or startup hook) to generate:
    - emi_upcoming  → if EMI is due within 3 days
    - emi_overdue   → if EMI due date has passed and no payment this month
"""
import logging
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from apps.loans.models import Loan, LoanStatus
from apps.payments.models import Payment, PaymentStatus
from apps.notifications.models import Notification, NotificationType

logger = logging.getLogger(__name__)

UPCOMING_DAYS_THRESHOLD = 3


class Command(BaseCommand):
    help = "Generate EMI upcoming and overdue notifications for all active loans."

    def handle(self, *args, **options):
        today = date.today()
        created_count = 0
        skipped_count = 0

        active_loans = Loan.objects.filter(status=LoanStatus.ACTIVE).select_related("user")
        self.stdout.write(f"Processing {active_loans.count()} active loans...")

        for loan in active_loans:
            # Determine next EMI date for this month
            import calendar as cal
            days_in_month = cal.monthrange(today.year, today.month)[1]
            emi_day = min(loan.start_date.day, days_in_month)
            this_month_due = date(today.year, today.month, emi_day)

            # Check if already paid this month
            paid_this_month = Payment.objects.filter(
                loan=loan,
                status=PaymentStatus.CONFIRMED,
                payment_date__year=today.year,
                payment_date__month=today.month,
            ).exists()

            if paid_this_month:
                continue

            # ── EMI Overdue ────────────────────────────────────────────────
            if this_month_due < today:
                dedup_key = f"emi_overdue-{loan.id}-{today.year}-{today.month}"
                if not Notification.objects.filter(dedup_key=dedup_key).exists():
                    Notification.objects.create(
                        user=loan.user,
                        title=f"⚠️ EMI Overdue — {loan.name}",
                        body=(
                            f"Your EMI of <b>₹{loan.monthly_emi:,.2f}</b> for <b>{loan.name}</b> "
                            f"was due on <b>{this_month_due.strftime('%d %b %Y')}</b> and has not been paid yet. "
                            f"Please make the payment as soon as possible."
                        ),
                        notif_type=NotificationType.EMI_OVERDUE,
                        loan=loan,
                        dedup_key=dedup_key,
                    )
                    created_count += 1
                    logger.info("emi_overdue notification created for loan %s", loan.name)
                else:
                    skipped_count += 1

            # ── EMI Upcoming ───────────────────────────────────────────────
            elif 0 <= (this_month_due - today).days <= UPCOMING_DAYS_THRESHOLD:
                days_left = (this_month_due - today).days
                dedup_key = f"emi_upcoming-{loan.id}-{today.isoformat()}"
                if not Notification.objects.filter(dedup_key=dedup_key).exists():
                    due_label = "today" if days_left == 0 else (
                        "tomorrow" if days_left == 1 else f"in {days_left} days"
                    )
                    Notification.objects.create(
                        user=loan.user,
                        title=f"📅 EMI Due {due_label.title()} — {loan.name}",
                        body=(
                            f"Your EMI of <b>₹{loan.monthly_emi:,.2f}</b> for <b>{loan.name}</b> "
                            f"is due <b>{due_label}</b> ({this_month_due.strftime('%d %b %Y')}). "
                            f"Make sure your account has sufficient balance."
                        ),
                        notif_type=NotificationType.EMI_UPCOMING,
                        loan=loan,
                        dedup_key=dedup_key,
                    )
                    created_count += 1
                    logger.info("emi_upcoming notification created for loan %s", loan.name)
                else:
                    skipped_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Created: {created_count} | Skipped (already exists): {skipped_count}"
            )
        )
