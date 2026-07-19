from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.assets.models import Asset, AssetType, AssetClass, Liability, LiabilityType, LiabilityClass
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
        self.asset_list_url = reverse("asset-list")
        self.liability_list_url = reverse("liability-list")
        self.net_worth_url = reverse("net-worth")

    def test_create_asset_auto_class(self):
        # Create Current Asset (bank)
        data = {
            "name": "HDFC Bank",
            "asset_type": "bank",
            "value": "25000.00"
        }
        response = self.client.post(self.asset_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Asset.objects.get(name="HDFC Bank").asset_class, AssetClass.CURRENT)

        # Create Fixed Asset (gold)
        data2 = {
            "name": "Physical Gold",
            "asset_type": "gold",
            "value": "150000.00"
        }
        response2 = self.client.post(self.asset_list_url, data2)
        self.assertEqual(response2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Asset.objects.get(name="Physical Gold").asset_class, AssetClass.FIXED)

    def test_create_liability(self):
        data = {
            "name": "Electricity Bill",
            "liability_type": "bill",
            "value": "1200.00"
        }
        response = self.client.post(self.liability_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Liability.objects.count(), 1)
        self.assertEqual(Liability.objects.get().liability_class, LiabilityClass.SHORT_TERM)

    def test_get_comprehensive_net_worth_summary(self):
        # Create assets
        Asset.objects.create(user=self.user, name="Cash", asset_type=AssetType.CASH, value="10000.00")
        Asset.objects.create(user=self.user, name="Gold ETF", asset_type=AssetType.GOLD, value="15000.00")

        # Create custom liability (bill)
        Liability.objects.create(user=self.user, name="Rent Due", liability_type=LiabilityType.RENT, value="5000.00")

        # Create active loan (long term liability)
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
        self.assertEqual(summary["current_assets"], 10000.00) # cash is current
        self.assertEqual(summary["fixed_assets"], 15000.00) # gold is fixed
        self.assertEqual(summary["total_liabilities"], 17000.00) # 5000 rent + 12000 loan
        self.assertEqual(summary["short_term_liabilities"], 5000.00)
        self.assertEqual(summary["long_term_liabilities"], 12000.00)
        self.assertEqual(summary["net_worth"], 8000.00) # 25000 - 17000
