"""
DebtProof — User API Views
Authentication and profile management endpoints.
"""
import logging
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.models import User
from .serializers import UserRegistrationSerializer, UserProfileSerializer

logger = logging.getLogger(__name__)


class AuthRateThrottle(AnonRateThrottle):
    """Stricter throttle for auth endpoints — 10 requests/minute."""
    scope = "auth"


class UserRegistrationView(generics.CreateAPIView):
    """
    POST /api/v1/auth/register/
    Create a new user account.
    Returns: User profile + JWT tokens.
    """

    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user: User = serializer.save()

        # Phase 1: Auto-provision Personal Organization, Workspace & Subscription
        try:
            from apps.tenants.middleware import TenantMiddleware
            TenantMiddleware(None)._provision_default_tenant(user)
        except Exception as e:
            logger.warning("Auto tenant provisioning failed for user %s: %s", user.email, e)

        # Generate JWT tokens immediately after registration
        refresh = RefreshToken.for_user(user)

        logger.info("New user registered: %s", user.email)

        return Response(
            {
                "success": True,
                "message": "Account created successfully.",
                "user": UserProfileSerializer(user).data,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/v1/auth/profile/ — Retrieve authenticated user's profile.
    PATCH /api/v1/auth/profile/ — Update profile fields.
    """

    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self) -> User:
        return self.request.user  # type: ignore[return-value]

    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(self.get_object())
        return Response({"success": True, "user": serializer.data})

    def partial_update(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"success": True, "message": "Profile updated.", "user": serializer.data}
        )


class LogoutView(generics.GenericAPIView):
    """
    POST /api/v1/auth/logout/
    Blacklist the provided refresh token, invalidating the session.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"success": False, "error": {"message": "Refresh token is required."}},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            logger.info("User logged out: %s", request.user.email)
            return Response(
                {"success": True, "message": "Logged out successfully."},
                status=status.HTTP_200_OK,
            )
        except Exception:
            return Response(
                {"success": False, "error": {"message": "Invalid or expired token."}},
                status=status.HTTP_400_BAD_REQUEST,
            )
