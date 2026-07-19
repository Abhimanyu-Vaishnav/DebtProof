from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.assets.models import Asset, AssetType
from apps.loans.models import Loan, LoanStatus

User = get_user_model()

class AssetAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            password="SecurePassword123!",
            first_name="Test",
            last_name="User"
        )
        self.client.force_authenticate(user=self.user)
        self.list_url = reverse("asset-list")
        self.net_worth_url = reverse("net-worth")

    def test_create_asset(self):
        data = {
            "name": "Savings Account",
            "asset_type": "bank",
            "value": "25000.00"
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Asset.objects.count(), 1)
        self.assertEqual(Asset.objects.get().name, "Savings Account")

    def test_create_asset_invalid_value(self):
        data = {
            "name": "Negative Cash",
            "asset_type": "cash",
            "value": "-500.00"
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_net_worth_summary(self):
        # Create assets
        Asset.objects.create(user=self.user, name="Cash", asset_type=AssetType.CASH, value="10000.00")
        Asset.objects.create(user=self.user, name="Gold ETF", asset_type=AssetType.GOLD, value="15000.00")

        # Create active loan (liability)
        Loan.objects.create(
            user=self.user,
            name="Personal Loan",
            loan_type="personal",
            lender_name="Bank",
            principal_amount="20000.00",
            outstanding_amount="12000.00",
            interest_rate="12.0",
            monthly_emi="1000.00",
            start_date="2026-01-01",
            end_date="2027-01-01",
            status=LoanStatus.ACTIVE
        )

        response = self.client.get(self.net_worth_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        summary = response.data["net_worth_summary"]
        self.assertEqual(summary["total_assets"], 25000.00)
        self.assertEqual(summary["total_liabilities"], 12000.00)
        self.assertEqual(summary["net_worth"], 13000.00)
        self.assertEqual(len(summary["type_distribution"]), 2)
