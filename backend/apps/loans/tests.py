from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.loans.models import Loan, LoanStatus

User = get_user_model()

class LoanAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="borrower@example.com",
            password="SecurePassword123!"
        )
        self.client.force_authenticate(user=self.user)
        self.list_create_url = reverse("loan-list-create")
        self.dashboard_url = reverse("loan-dashboard")
        
        self.loan_data = {
            "name": "Car Loan",
            "lender_name": "State Bank",
            "loan_type": "vehicle",
            "principal_amount": Decimal("500000.00"),
            "outstanding_amount": Decimal("500000.00"),
            "interest_rate": Decimal("8.50"),
            "monthly_emi": Decimal("12000.00"),
            "start_date": "2026-01-01",
            "end_date": "2031-01-01",
            "status": "active"
        }

    def test_create_loan(self):
        """Test creating a new loan successfully."""
        response = self.client.post(self.list_create_url, self.loan_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["loan"]["name"], "Car Loan")

    def test_get_loans_list(self):
        """Test retrieving all active loans for the authenticated user."""
        Loan.objects.create(user=self.user, **self.loan_data)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_get_loan_detail(self):
        """Test retrieving specific loan details."""
        loan = Loan.objects.create(user=self.user, **self.loan_data)
        detail_url = reverse("loan-detail", kwargs={"pk": loan.id})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["loan"]["name"], loan.name)

    def test_delete_loan_no_payments(self):
        """Test deleting a loan with zero recorded payments is allowed."""
        loan = Loan.objects.create(user=self.user, **self.loan_data)
        detail_url = reverse("loan-detail", kwargs={"pk": loan.id})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Loan.objects.filter(id=loan.id).exists())

    def test_get_dashboard_statistics(self):
        """Test retrieve aggregate dashboard statistics."""
        Loan.objects.create(user=self.user, **self.loan_data)
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["dashboard"]["total_loans"], 1)
        self.assertEqual(float(response.data["dashboard"]["total_outstanding"]), 500000.0)
