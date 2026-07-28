"""
DebtProof — User Auth URL Routes
All routes live under /api/v1/auth/
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import (
    UserRegistrationView, UserProfileView, LogoutView,
    SuperAdminUserListView, SuperAdminStatsView, SuperAdminLoansView, SuperAdminPaymentsView,
    SuperAdminStaffView, SuperAdminStaffDetailView, SuperAdminTicketsView, SuperAdminTicketActionView,
    SuperAdminUserActionView, SuperAdminUserDetailView, SuperAdminBlockchainAuditView,
    SuperAdminAuditLogView, SuperAdminCSVExportView,
    SuperAdminFraudAlertsView, SuperAdminBackupView, SuperAdminMonadEscrowView, SuperAdminRevenueAnalyticsView,
)
from .jwt_views import CustomTokenObtainPairView

app_name = "users"

urlpatterns = [
    # Registration
    path("register/", UserRegistrationView.as_view(), name="register"),

    # JWT Login (returns access + refresh)
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),

    # SuperAdmin — Real Database Endpoints
    path("superadmin/users/", SuperAdminUserListView.as_view(), name="superadmin-users"),
    path("superadmin/stats/", SuperAdminStatsView.as_view(), name="superadmin-stats"),
    path("superadmin/loans/", SuperAdminLoansView.as_view(), name="superadmin-loans"),
    path("superadmin/payments/", SuperAdminPaymentsView.as_view(), name="superadmin-payments"),
    path("superadmin/staff/", SuperAdminStaffView.as_view(), name="superadmin-staff"),
    path("superadmin/staff/<uuid:pk>/", SuperAdminStaffDetailView.as_view(), name="superadmin-staff-detail"),
    path("superadmin/tickets/", SuperAdminTicketsView.as_view(), name="superadmin-tickets"),
    path("superadmin/tickets/<uuid:pk>/<str:action>/", SuperAdminTicketActionView.as_view(), name="superadmin-ticket-action"),
    path("superadmin/users/<uuid:pk>/detail/", SuperAdminUserDetailView.as_view(), name="superadmin-user-detail"),
    path("superadmin/users/<uuid:pk>/<str:action>/", SuperAdminUserActionView.as_view(), name="superadmin-user-action"),
    path("superadmin/blockchain-audit/", SuperAdminBlockchainAuditView.as_view(), name="superadmin-blockchain-audit"),
    path("superadmin/audit-log/", SuperAdminAuditLogView.as_view(), name="superadmin-audit-log"),
    path("superadmin/export/<str:resource>/", SuperAdminCSVExportView.as_view(), name="superadmin-export-csv"),

    # Advanced SuperAdmin Modules
    path("superadmin/fraud-alerts/", SuperAdminFraudAlertsView.as_view(), name="superadmin-fraud-alerts"),
    path("superadmin/backups/", SuperAdminBackupView.as_view(), name="superadmin-backups"),
    path("superadmin/backups/create/", SuperAdminBackupView.as_view(), name="superadmin-backups-create"),
    path("superadmin/monad-escrow/", SuperAdminMonadEscrowView.as_view(), name="superadmin-monad-escrow"),
    path("superadmin/revenue-analytics/", SuperAdminRevenueAnalyticsView.as_view(), name="superadmin-revenue-analytics"),

    # Token management
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token-verify"),

    # Profile
    path("profile/", UserProfileView.as_view(), name="profile"),

    # Logout (blacklists refresh token)
    path("logout/", LogoutView.as_view(), name="logout"),
]

