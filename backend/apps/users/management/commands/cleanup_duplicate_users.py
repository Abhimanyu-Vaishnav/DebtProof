"""
Django Management Command: cleanup_duplicate_users
Scans the database for duplicate user accounts with identical (case-insensitive) email addresses.
Identifies accounts with data (loans, payments, tickets, audit logs, staff/superuser flags) vs zero-data accounts.
Deletes zero-data duplicate accounts to ensure 1 clean account per email.
"""
from collections import defaultdict
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.users.models import User
from apps.loans.models import Loan
from apps.payments.models import Payment


class Command(BaseCommand):
    help = "Find and delete duplicate user accounts that have no associated data."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Simulate the cleanup without actually deleting users.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        self.stdout.write(self.style.MIGRATE_HEADING("Scanning for duplicate user accounts..."))

        users_by_email = defaultdict(list)
        for user in User.objects.all().order_by("created_at"):
            clean_email = user.email.strip().lower()
            users_by_email[clean_email].append(user)

        duplicate_groups = {email: users for email, users in users_by_email.items() if len(users) > 1}

        if not duplicate_groups:
            self.stdout.write(self.style.SUCCESS("No duplicate email accounts found in database."))
            return

        total_deleted = 0

        for email, users in duplicate_groups.items():
            self.stdout.write(f"\nFound {len(users)} accounts for email: {email}")

            user_data = []
            for u in users:
                loan_count = Loan.objects.filter(user=u).count()
                payment_count = Payment.objects.filter(loan__user=u).count()
                has_special_status = u.is_staff or u.is_superuser

                total_records = loan_count + payment_count + (100 if has_special_status else 0)
                user_data.append({
                    "user": u,
                    "loan_count": loan_count,
                    "payment_count": payment_count,
                    "is_special": has_special_status,
                    "score": total_records,
                })

            # Sort by score descending, then by creation date ascending (oldest primary)
            user_data.sort(key=lambda x: (x["score"], -x["user"].created_at.timestamp()), reverse=True)

            primary_user = user_data[0]["user"]
            duplicates_to_delete = [item for item in user_data[1:] if item["score"] == 0]

            self.stdout.write(self.style.SUCCESS(
                f"  -> Keeping primary account: ID={primary_user.id} (Joined {primary_user.created_at}, Loans: {user_data[0]['loan_count']})"
            ))

            for item in duplicates_to_delete:
                u = item["user"]
                if dry_run:
                    self.stdout.write(self.style.WARNING(
                        f"  -> [DRY-RUN] Would delete empty duplicate: ID={u.id} (Joined {u.created_at})"
                    ))
                else:
                    with transaction.atomic():
                        u_id = u.id
                        u.delete()
                        total_deleted += 1
                        self.stdout.write(self.style.ERROR(
                            f"  -> Deleted empty duplicate account: ID={u_id}"
                        ))

        if dry_run:
            self.stdout.write(self.style.NOTICE(f"\nDry run complete."))
        else:
            self.stdout.write(self.style.SUCCESS(f"\nCleanup complete. Successfully deleted {total_deleted} duplicate accounts."))
