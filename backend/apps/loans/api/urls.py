"""
DebtProof — Loan API URL Configuration
"""
from django.urls import path
from .views import (
    LoanListCreateView,
    LoanRetrieveUpdateDestroyView,
    LoanDashboardView,
    EMICalendarView,
    ExportLoansCSVView,
    P2PMarketplaceView,
    LoanSimulationView,
)

urlpatterns = [
    path("", LoanListCreateView.as_view(), name="loan-list-create"),
    path("marketplace/", P2PMarketplaceView.as_view(), name="loan-marketplace"),
    path("dashboard/", LoanDashboardView.as_view(), name="loan-dashboard"),
    path("simulate/", LoanSimulationView.as_view(), name="loan-simulate"),
    path("calendar/", EMICalendarView.as_view(), name="loan-calendar"),
    path("export/csv/", ExportLoansCSVView.as_view(), name="loans-export-csv"),
    path("<uuid:pk>/", LoanRetrieveUpdateDestroyView.as_view(), name="loan-detail"),
]


