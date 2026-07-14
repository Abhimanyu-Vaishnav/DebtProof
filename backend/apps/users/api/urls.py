"""
DebtProof — User Auth URL Routes
All routes live under /api/v1/auth/
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from .views import UserRegistrationView, UserProfileView, LogoutView

app_name = "users"

urlpatterns = [
    # Registration
    path("register/", UserRegistrationView.as_view(), name="register"),

    # JWT Login (returns access + refresh)
    path("login/", TokenObtainPairView.as_view(), name="login"),

    # Token management
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token-verify"),

    # Profile
    path("profile/", UserProfileView.as_view(), name="profile"),

    # Logout (blacklists refresh token)
    path("logout/", LogoutView.as_view(), name="logout"),
]
