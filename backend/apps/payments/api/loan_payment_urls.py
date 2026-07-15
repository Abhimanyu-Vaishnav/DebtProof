"""
DebtProof — Loan-nested Payment URLs
Registered under /api/v1/loans/{loan_id}/payments/
"""
from django.urls import path
from .views import LoanPaymentListCreateView

urlpatterns = [
    path("", LoanPaymentListCreateView.as_view(), name="loan-payment-list-create"),
]
