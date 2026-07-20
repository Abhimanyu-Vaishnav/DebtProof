"""
DebtProof — Notifications App Tests
"""
from datetime import date
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.notifications.models import Notification, NotificationType
from apps.loans.models import Loan, LoanType, LoanStatus
from apps.payments.models import Payment, PaymentStatus

User = get_user_model()


class NotificationSignalTests(TestCase):
    """Tests for auto-notification signals."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="notify@example.com",
            password="testpass123",
            first_name="Notify",
            last_name="Test",
        )
        self.loan = Loan.objects.create(
            user=self.user,
            name="Test Loan",
            loan_type=LoanType.PERSONAL,
            lender_name="Test Bank",
            principal_amount=Decimal("100000.00"),
            outstanding_amount=Decimal("100000.00"),
            interest_rate=Decimal("10.00"),
            monthly_emi=Decimal("5000.00"),
            start_date=date(2025, 1, 1),
            end_date=date(2027, 1, 1),
            status=LoanStatus.ACTIVE,
        )


    def test_payment_creates_notification(self):
        """Creating a confirmed payment should auto-create a payment_received notification."""
        Payment.objects.create(
            loan=self.loan,
            amount="5000.00",
            payment_date=date.today(),
            status=PaymentStatus.CONFIRMED,
        )
        notifs = Notification.objects.filter(
            user=self.user,
            notif_type=NotificationType.PAYMENT_RECEIVED,
        )
        self.assertEqual(notifs.count(), 1)
        self.assertIn("5,000.00", notifs.first().body)

    def test_payment_no_duplicate_notification(self):
        """Same payment should not create duplicate notifications."""
        payment = Payment.objects.create(
            loan=self.loan,
            amount="5000.00",
            payment_date=date.today(),
            status=PaymentStatus.CONFIRMED,
        )
        # Save again (simulates signal re-firing)
        payment.save()
        notifs = Notification.objects.filter(
            user=self.user,
            notif_type=NotificationType.PAYMENT_RECEIVED,
        )
        self.assertEqual(notifs.count(), 1, "Duplicate payment_received notifications should not be created")

    def test_pending_payment_no_notification(self):
        """A pending payment should NOT trigger a payment_received notification."""
        Payment.objects.create(
            loan=self.loan,
            amount="5000.00",
            payment_date=date.today(),
            status=PaymentStatus.PENDING,
        )
        notifs = Notification.objects.filter(
            user=self.user,
            notif_type=NotificationType.PAYMENT_RECEIVED,
        )
        self.assertEqual(notifs.count(), 0)


class NotificationAPITests(TestCase):
    """Tests for notification API endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="api@example.com",
            password="testpass123",
            first_name="API",
            last_name="Test",
        )
        self.client.force_login(self.user)
        # Create some test notifications
        Notification.objects.create(
            user=self.user,
            title="Test Unread",
            body="Unread notification",
            notif_type=NotificationType.INFO,
            is_read=False,
        )
        Notification.objects.create(
            user=self.user,
            title="Test Read",
            body="Read notification",
            notif_type=NotificationType.INFO,
            is_read=True,
        )

    def _get_token(self):
        from rest_framework_simplejwt.tokens import RefreshToken
        token = RefreshToken.for_user(self.user)
        return str(token.access_token)

    def test_list_notifications(self):
        token = self._get_token()
        resp = self.client.get(
            "/api/v1/notifications/",
            HTTP_AUTHORIZATION=f"Bearer {token}"
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("results", resp.json())
        self.assertEqual(len(resp.json()["results"]), 2)

    def test_unread_count(self):
        token = self._get_token()
        resp = self.client.get(
            "/api/v1/notifications/unread-count/",
            HTTP_AUTHORIZATION=f"Bearer {token}"
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["count"], 1)

    def test_mark_single_read(self):
        notif = Notification.objects.filter(user=self.user, is_read=False).first()
        token = self._get_token()
        resp = self.client.post(
            f"/api/v1/notifications/{notif.id}/read/",
            HTTP_AUTHORIZATION=f"Bearer {token}"
        )
        self.assertEqual(resp.status_code, 200)
        notif.refresh_from_db()
        self.assertTrue(notif.is_read)

    def test_mark_all_read(self):
        token = self._get_token()
        resp = self.client.post(
            "/api/v1/notifications/read-all/",
            HTTP_AUTHORIZATION=f"Bearer {token}"
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["updated"], 1)
        self.assertEqual(
            Notification.objects.filter(user=self.user, is_read=False).count(), 0
        )

    def test_delete_notification(self):
        notif = Notification.objects.filter(user=self.user).first()
        token = self._get_token()
        resp = self.client.delete(
            f"/api/v1/notifications/{notif.id}/",
            HTTP_AUTHORIZATION=f"Bearer {token}"
        )
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(Notification.objects.filter(id=notif.id).exists())
