"""
DebtProof — User Auth URL Routes
All routes live under /api/v1/auth/
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import (
    UserRegistrationView, UserProfileView, LogoutView,
    SuperAdminUserListView, SuperAdminStatsView, SuperAdminLoansView, SuperAdminPaymentsView,
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

    # Token management
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token-verify"),

    # Profile
    path("profile/", UserProfileView.as_view(), name="profile"),

    # Logout (blacklists refresh token)
    path("logout/", LogoutView.as_view(), name="logout"),
]
