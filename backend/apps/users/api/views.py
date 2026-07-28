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
from rest_framework.views import APIView
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


class SuperAdminUserListView(APIView):
    """
    GET /api/v1/auth/superadmin/users/
    Returns actual Django database users, total loan counts, and total debt volumes for SuperAdmin dashboard.
    """
    permission_classes = []
    throttle_classes = []

    def get(self, request: Request, *args, **kwargs) -> Response:
        users = User.objects.all().order_by("-created_at")
        results = []

        from apps.loans.models import Loan
        from django.db.models import Sum

        for u in users:
            user_loans = Loan.objects.filter(user=u)
            active_loans_count = user_loans.filter(status="active").count()
            total_vol = user_loans.aggregate(total=Sum("principal_amount"))["total"] or 0

            results.append({
                "id": str(u.id),
                "name": f"{u.first_name} {u.last_name}".strip() or u.email.split("@")[0].capitalize(),
                "email": u.email,
                "plan": "Enterprise" if u.is_superuser else ("Pro" if u.is_staff else "Free"),
                "priority": "High" if u.is_superuser else "Normal",
                "status": "Active" if u.is_active else "Suspended",
                "joinedDate": u.created_at.strftime("%Y-%m-%d"),
                "loansCount": active_loans_count,
                "totalDebtVolume": float(total_vol),
                "isSuperuser": u.is_superuser,
                "isStaff": u.is_staff,
                "lastLogin": u.last_login.strftime("%Y-%m-%d %H:%M") if u.last_login else None,
            })

        # Calculate actual system-wide database aggregates
        all_loans_volume = Loan.objects.aggregate(total=Sum("principal_amount"))["total"] or 0
        enterprise_count = User.objects.filter(is_superuser=True).count()
        pro_count = User.objects.filter(is_staff=True, is_superuser=False).count()

        stats = {
            "totalUsersCount": len(results),
            "enterpriseUsersCount": enterprise_count,
            "proUsersCount": pro_count,
            "freeUsersCount": max(0, len(results) - (enterprise_count + pro_count)),
            "totalSystemDebtVolume": float(all_loans_volume),
        }

        return Response({"success": True, "count": len(results), "users": results, "stats": stats})


class SuperAdminStatsView(APIView):
    """
    GET /api/v1/auth/superadmin/stats/
    Returns platform-wide aggregate metrics for the SuperAdmin dashboard overview.
    """
    permission_classes = []
    throttle_classes = []

    def get(self, request: Request, *args, **kwargs) -> Response:
        from apps.loans.models import Loan
        from apps.payments.models import Payment
        from django.db.models import Sum, Count
        from django.utils import timezone
        from datetime import timedelta

        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        suspended_users = User.objects.filter(is_active=False).count()

        total_loans = Loan.objects.count()
        active_loans = Loan.objects.filter(status="active").count()
        closed_loans = Loan.objects.filter(status="closed").count()
        overdue_loans = Loan.objects.filter(status="defaulted").count()
        total_debt_volume = Loan.objects.aggregate(t=Sum("principal_amount"))["t"] or 0
        total_outstanding = Loan.objects.filter(status="active").aggregate(t=Sum("outstanding_amount"))["t"] or 0

        total_payments = Payment.objects.count()
        total_paid = Payment.objects.filter(status="confirmed").aggregate(t=Sum("amount"))["t"] or 0
        failed_payments = Payment.objects.filter(status="failed").count()

        # Loan type breakdown
        loan_types = list(
            Loan.objects.values("loan_type").annotate(count=Count("id")).order_by("-count")
        )

        # Monthly signups for last 12 months
        now = timezone.now()
        monthly_signups = []
        for i in range(11, -1, -1):
            month_start = (now.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
            month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1)
            count = User.objects.filter(created_at__gte=month_start, created_at__lt=month_end).count()
            monthly_signups.append({
                "month": month_start.strftime("%b %Y"),
                "count": count,
            })

        # Recent 5 users
        recent_users = []
        for u in User.objects.order_by("-created_at")[:5]:
            recent_users.append({
                "name": f"{u.first_name} {u.last_name}".strip() or u.email.split("@")[0].capitalize(),
                "email": u.email,
                "joined": u.created_at.strftime("%Y-%m-%d"),
            })

        return Response({
            "total_users": total_users,
            "active_users": active_users,
            "suspended_users": suspended_users,
            "total_loans": total_loans,
            "active_loans": active_loans,
            "closed_loans": closed_loans,
            "overdue_loans": overdue_loans,
            "total_debt_volume": float(total_debt_volume),
            "total_outstanding": float(total_outstanding),
            "total_payments": total_payments,
            "total_paid": float(total_paid),
            "failed_payments": failed_payments,
            "loan_type_breakdown": loan_types,
            "monthly_signups": monthly_signups,
            "recent_users": recent_users,
        })


class SuperAdminLoansView(APIView):
    """
    GET /api/v1/auth/superadmin/loans/
    Returns all loans across all users for SuperAdmin Loan Management tab.
    """
    permission_classes = []
    throttle_classes = []

    def get(self, request: Request, *args, **kwargs) -> Response:
        from apps.loans.models import Loan
        loans = Loan.objects.select_related("user").order_by("-created_at")[:200]
        results = []
        for loan in loans:
            results.append({
                "id": str(loan.id),
                "name": loan.name,
                "loan_type": loan.loan_type,
                "status": loan.status,
                "user_name": f"{loan.user.first_name} {loan.user.last_name}".strip() or loan.user.email.split("@")[0].capitalize(),
                "user_email": loan.user.email,
                "lender": loan.lender_name,
                "principal": float(loan.principal_amount),
                "outstanding": float(loan.outstanding_amount) if hasattr(loan, "outstanding_amount") else 0,
                "interest_rate": float(loan.interest_rate) if loan.interest_rate else 0,
                "monthly_emi": float(loan.monthly_emi) if loan.monthly_emi else 0,
                "created_at": loan.created_at.strftime("%Y-%m-%d"),
            })
        return Response({"success": True, "count": len(results), "loans": results})


class SuperAdminPaymentsView(APIView):
    """
    GET /api/v1/auth/superadmin/payments/
    Returns all payment transactions across all users for SuperAdmin Payment Monitor.
    """
    permission_classes = []
    throttle_classes = []

    def get(self, request: Request, *args, **kwargs) -> Response:
        from apps.payments.models import Payment
        payments = Payment.objects.select_related("loan__user").order_by("-created_at")[:200]
        results = []
        for p in payments:
            results.append({
                "id": str(p.id),
                "amount": float(p.amount),
                "status": p.status,
                "payment_method": p.payment_method if hasattr(p, "payment_method") else "—",
                "loan_name": p.loan.name,
                "user_name": f"{p.loan.user.first_name} {p.loan.user.last_name}".strip() or p.loan.user.email.split("@")[0].capitalize(),
                "user_email": p.loan.user.email,
                "paid_on": p.created_at.strftime("%Y-%m-%d"),
                "notes": p.notes if hasattr(p, "notes") else "",
            })
        return Response({"success": True, "count": len(results), "payments": results})



