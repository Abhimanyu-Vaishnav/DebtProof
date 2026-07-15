"""
DebtProof — Loan API URL Configuration
"""
from django.urls import path
from .views import LoanListCreateView, LoanRetrieveUpdateDestroyView, LoanDashboardView

urlpatterns = [
    path("", LoanListCreateView.as_view(), name="loan-list-create"),
    path("dashboard/", LoanDashboardView.as_view(), name="loan-dashboard"),
    path("<uuid:pk>/", LoanRetrieveUpdateDestroyView.as_view(), name="loan-detail"),
]
