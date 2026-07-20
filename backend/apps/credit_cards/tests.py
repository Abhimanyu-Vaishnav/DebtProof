"""
DebtProof — Credit Card App Tests
"""
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.credit_cards.models import CreditCard, CreditCardStatus

User = get_user_model()


class CreditCardModelTests(TestCase):
    """
    Tests properties and behavior of the CreditCard model.
    """

    def setUp(self):
        self.user = User.objects.create_user(
            email="card@example.com",
            password="testpass123",
            first_name="Card",
            last_name="Test",
        )

    def test_properties_calculations(self):
        card = CreditCard.objects.create(
            user=self.user,
            card_name="Amazon Pay",
            bank_name="ICICI Bank",
            credit_limit=Decimal("100000.00"),
            current_outstanding=Decimal("30000.00"),
            interest_rate=Decimal("42.00"),
            statement_date=15,
            due_date=5,
        )
        self.assertEqual(card.utilization_rate, 30.0)
        self.assertEqual(card.available_limit, Decimal("70000.00"))


class CreditCardAPITests(TestCase):
    """
    Tests credit card REST API views.
    """

    def setUp(self):
        self.user = User.objects.create_user(
            email="api_cc@example.com",
            password="testpass123",
            first_name="API",
            last_name="CC",
        )
        self.client.force_login(self.user)
        self.card = CreditCard.objects.create(
            user=self.user,
            card_name="Regalia",
            bank_name="HDFC",
            credit_limit=Decimal("200000.00"),
            current_outstanding=Decimal("50000.00"),
            interest_rate=Decimal("38.00"),
            statement_date=20,
            due_date=10,
        )

    def _get_token(self):
        from rest_framework_simplejwt.tokens import RefreshToken
        token = RefreshToken.for_user(self.user)
        return str(token.access_token)

    def test_list_cards(self):
        token = self._get_token()
        resp = self.client.get(
            "/api/v1/credit-cards/",
            HTTP_AUTHORIZATION=f"Bearer {token}"
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("results", resp.json())
        self.assertEqual(len(resp.json()["results"]), 1)

    def test_summary_aggregates(self):
        token = self._get_token()
        # Add another card
        CreditCard.objects.create(
            user=self.user,
            card_name="OneCard",
            bank_name="Federal Bank",
            credit_limit=Decimal("100000.00"),
            current_outstanding=Decimal("10000.00"),
            interest_rate=Decimal("36.00"),
            statement_date=1,
            due_date=18,
        )
        resp = self.client.get(
            "/api/v1/credit-cards/summary/",
            HTTP_AUTHORIZATION=f"Bearer {token}"
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["total_cards"], 2)
        self.assertEqual(data["total_limit"], 300000.0)
        self.assertEqual(data["total_outstanding"], 60000.0)
        self.assertEqual(data["overall_utilization"], 20.0)

    def test_outstanding_validation(self):
        token = self._get_token()
        payload = {
            "card_name": "Invalid Card",
            "bank_name": "Fake Bank",
            "credit_limit": 50000.00,
            "current_outstanding": 60000.00, # exceed limit
            "interest_rate": 30.00,
            "statement_date": 10,
            "due_date": 25,
        }
        resp = self.client.post(
            "/api/v1/credit-cards/",
            data=payload,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {token}"
        )
        self.assertEqual(resp.status_code, 400)
        self.assertIn("current_outstanding", resp.json()["error"]["details"])

