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
                "payment_date": p.payment_date.strftime("%Y-%m-%d") if hasattr(p, "payment_date") and p.payment_date else p.created_at.strftime("%Y-%m-%d"),
                "reference": p.reference_number if hasattr(p, "reference_number") else "",
            })
        return Response({"success": True, "count": len(results), "payments": results})


# ─────────────────────────────────────────────────────────────────────────────
#  STAFF MANAGEMENT
# ─────────────────────────────────────────────────────────────────────────────

class SuperAdminStaffView(APIView):
    """
    GET  /api/v1/auth/superadmin/staff/     → list all staff
    POST /api/v1/auth/superadmin/staff/     → promote user to staff
    """
    permission_classes = []
    throttle_classes = []

    def get(self, request: Request) -> Response:
        from apps.users.models import StaffProfile
        profiles = StaffProfile.objects.select_related("user").order_by("-created_at")
        results = []
        for p in profiles:
            u = p.user
            results.append({
                "id": str(p.id),
                "user_id": str(u.id),
                "name": f"{u.first_name} {u.last_name}".strip() or u.email.split("@")[0].capitalize(),
                "email": u.email,
                "role": p.role,
                "department": p.department,
                "queries_resolved": p.queries_resolved,
                "avg_rating": float(p.avg_rating),
                "is_active": p.is_active,
                "notes": p.notes,
                "joined": u.created_at.strftime("%Y-%m-%d"),
            })
        return Response({"success": True, "count": len(results), "staff": results})

    def post(self, request: Request) -> Response:
        from apps.users.models import StaffProfile
        user_email = request.data.get("email", "").strip()
        role = request.data.get("role", "CustomerSupport")
        department = request.data.get("department", "Support")
        notes = request.data.get("notes", "")

        try:
            user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            return Response({"error": f"No user with email '{user_email}' found. User must register first."}, status=status.HTTP_404_NOT_FOUND)

        profile, created = StaffProfile.objects.get_or_create(
            user=user,
            defaults={"role": role, "department": department, "notes": notes}
        )
        if not created:
            profile.role = role
            profile.department = department
            profile.is_active = True
            profile.notes = notes
            profile.save()

        # Also mark Django user as staff
        user.is_staff = True
        user.save(update_fields=["is_staff"])

        return Response({
            "success": True,
            "message": f"{'Created' if created else 'Updated'} staff profile for {user.email}",
            "id": str(profile.id),
        })


class SuperAdminStaffDetailView(APIView):
    """
    PATCH  /api/v1/auth/superadmin/staff/<id>/  → update role/status
    DELETE /api/v1/auth/superadmin/staff/<id>/  → remove staff (keeps user account)
    """
    permission_classes = []
    throttle_classes = []

    def patch(self, request: Request, pk: str) -> Response:
        from apps.users.models import StaffProfile
        try:
            profile = StaffProfile.objects.select_related("user").get(id=pk)
        except StaffProfile.DoesNotExist:
            return Response({"error": "Staff not found"}, status=status.HTTP_404_NOT_FOUND)

        if "role" in request.data:
            profile.role = request.data["role"]
        if "department" in request.data:
            profile.department = request.data["department"]
        if "is_active" in request.data:
            profile.is_active = request.data["is_active"]
        if "notes" in request.data:
            profile.notes = request.data["notes"]
        profile.save()
        return Response({"success": True, "message": "Staff profile updated"})

    def delete(self, request: Request, pk: str) -> Response:
        from apps.users.models import StaffProfile
        try:
            profile = StaffProfile.objects.select_related("user").get(id=pk)
        except StaffProfile.DoesNotExist:
            return Response({"error": "Staff not found"}, status=status.HTTP_404_NOT_FOUND)
        # Revoke staff flag on User
        profile.user.is_staff = False
        profile.user.save(update_fields=["is_staff"])
        profile.delete()
        return Response({"success": True, "message": "Staff profile removed"})


# ─────────────────────────────────────────────────────────────────────────────
#  SUPPORT TICKETS
# ─────────────────────────────────────────────────────────────────────────────

class SuperAdminTicketsView(APIView):
    """
    GET  /api/v1/auth/superadmin/tickets/  → list all tickets
    POST /api/v1/auth/superadmin/tickets/  → create ticket (admin files on behalf of user)
    """
    permission_classes = []
    throttle_classes = []

    def _serialize(self, t):
        return {
            "id": str(t.id),
            "user_name": (f"{t.user.first_name} {t.user.last_name}".strip() or t.user.email.split("@")[0].capitalize()) if t.user else "Unknown",
            "user_email": t.user.email if t.user else "—",
            "subject": t.subject,
            "message": t.message,
            "priority": t.priority,
            "status": t.status,
            "assigned_to": t.assigned_to.user.email if t.assigned_to else None,
            "assigned_name": (f"{t.assigned_to.user.first_name} {t.assigned_to.user.last_name}".strip() or t.assigned_to.user.email) if t.assigned_to else "Unassigned",
            "resolution_notes": t.resolution_notes,
            "resolved_at": t.resolved_at.strftime("%Y-%m-%d %H:%M") if t.resolved_at else None,
            "filed_by_admin": t.filed_by_admin,
            "created_at": t.created_at.strftime("%Y-%m-%d %H:%M"),
        }

    def get(self, request: Request) -> Response:
        from apps.users.models import SupportTicket
        tickets = SupportTicket.objects.select_related("user", "assigned_to__user").order_by("-created_at")
        return Response({"success": True, "count": tickets.count(), "tickets": [self._serialize(t) for t in tickets]})

    def post(self, request: Request) -> Response:
        from apps.users.models import SupportTicket
        user_email = request.data.get("user_email", "").strip()
        subject = request.data.get("subject", "").strip()
        message = request.data.get("message", "").strip()
        priority = request.data.get("priority", "normal")

        if not subject:
            return Response({"error": "Subject is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = None
        if user_email:
            try:
                user = User.objects.get(email=user_email)
            except User.DoesNotExist:
                pass

        ticket = SupportTicket.objects.create(
            user=user, subject=subject, message=message,
            priority=priority, filed_by_admin=True,
        )
        return Response({"success": True, "message": "Ticket created", "id": str(ticket.id), "ticket": self._serialize(ticket)})


class SuperAdminTicketActionView(APIView):
    """
    POST /api/v1/auth/superadmin/tickets/<id>/assign/   → assign to staff
    POST /api/v1/auth/superadmin/tickets/<id>/resolve/  → resolve
    POST /api/v1/auth/superadmin/tickets/<id>/close/    → close
    """
    permission_classes = []
    throttle_classes = []

    def post(self, request: Request, pk: str, action: str) -> Response:
        from apps.users.models import SupportTicket, StaffProfile
        from django.utils import timezone
        try:
            ticket = SupportTicket.objects.select_related("user", "assigned_to__user").get(id=pk)
        except SupportTicket.DoesNotExist:
            return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

        if action == "assign":
            staff_id = request.data.get("staff_id", "")
            try:
                staff = StaffProfile.objects.get(id=staff_id)
                ticket.assigned_to = staff
                ticket.status = "in_progress"
                ticket.save()
                staff.queries_resolved = getattr(staff, "queries_resolved", 0)
                return Response({"success": True, "message": f"Ticket assigned to {staff.user.email}"})
            except StaffProfile.DoesNotExist:
                return Response({"error": "Staff not found"}, status=status.HTTP_404_NOT_FOUND)

        elif action == "resolve":
            ticket.status = "resolved"
            ticket.resolution_notes = request.data.get("notes", "Resolved by SuperAdmin")
            ticket.resolved_at = timezone.now()
            ticket.save()
            # Increment queries_resolved on assigned staff
            if ticket.assigned_to:
                ticket.assigned_to.queries_resolved += 1
                ticket.assigned_to.save(update_fields=["queries_resolved"])
            return Response({"success": True, "message": "Ticket resolved"})

        elif action == "close":
            ticket.status = "closed"
            ticket.save()
            return Response({"success": True, "message": "Ticket closed"})

        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────────────────
#  USER ACTIONS: SUSPEND / ACTIVATE
# ─────────────────────────────────────────────────────────────────────────────

class SuperAdminUserActionView(APIView):
    """
    POST /api/v1/auth/superadmin/users/<id>/suspend/   → deactivate user
    POST /api/v1/auth/superadmin/users/<id>/activate/  → reactivate user
    """
    permission_classes = []
    throttle_classes = []

    def post(self, request: Request, pk: str, action: str) -> Response:
        try:
            user = User.objects.get(id=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if action == "suspend":
            user.is_active = False
            user.save(update_fields=["is_active"])
            return Response({"success": True, "message": f"User {user.email} suspended"})
        elif action == "activate":
            user.is_active = True
            user.save(update_fields=["is_active"])
            return Response({"success": True, "message": f"User {user.email} activated"})

        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)


class SuperAdminUserDetailView(APIView):
    """
    GET /api/v1/auth/superadmin/users/<id>/detail/
    Full user profile: info + all loans + all payments
    """
    permission_classes = []
    throttle_classes = []

    def get(self, request: Request, pk: str) -> Response:
        from apps.loans.models import Loan
        from apps.payments.models import Payment
        from django.db.models import Sum
        try:
            user = User.objects.get(id=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        loans = Loan.objects.filter(user=user).order_by("-created_at")
        loan_data = [{
            "id": str(l.id), "name": l.name, "loan_type": l.loan_type,
            "status": l.status, "principal": float(l.principal_amount),
            "outstanding": float(l.outstanding_amount) if hasattr(l, "outstanding_amount") else 0,
            "monthly_emi": float(l.monthly_emi) if l.monthly_emi else 0,
            "lender": l.lender_name, "created_at": l.created_at.strftime("%Y-%m-%d"),
        } for l in loans]

        payments = Payment.objects.filter(loan__user=user).order_by("-created_at")[:20]
        payment_data = [{
            "id": str(p.id), "amount": float(p.amount),
            "status": p.status, "loan_name": p.loan.name,
            "paid_on": p.created_at.strftime("%Y-%m-%d"),
            "method": p.payment_method,
        } for p in payments]

        total_debt = loans.aggregate(t=Sum("principal_amount"))["t"] or 0
        total_paid = Payment.objects.filter(loan__user=user, status="confirmed").aggregate(t=Sum("amount"))["t"] or 0

        return Response({
            "id": str(user.id),
            "name": f"{user.first_name} {user.last_name}".strip() or user.email,
            "email": user.email,
            "phone": user.phone_number,
            "bio": user.bio,
            "is_active": user.is_active,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "joined": user.created_at.strftime("%Y-%m-%d"),
            "last_login": user.last_login.strftime("%Y-%m-%d %H:%M") if user.last_login else None,
            "total_loans": loans.count(),
            "total_debt": float(total_debt),
            "total_paid": float(total_paid),
            "loans": loan_data,
            "payments": payment_data,
        })


# ─────────────────────────────────────────────────────────────────────────────
#  BLOCKCHAIN AUDIT (real Receipt data)
# ─────────────────────────────────────────────────────────────────────────────

class SuperAdminBlockchainAuditView(APIView):
    """
    GET /api/v1/auth/superadmin/blockchain-audit/
    Returns real blockchain receipt records from the DB.
    """
    permission_classes = []
    throttle_classes = []

    def get(self, request: Request) -> Response:
        from apps.payments.models import Receipt
        receipts = Receipt.objects.select_related("payment__loan__user").order_by("-created_at")[:100]
        results = []
        for r in receipts:
            u = r.payment.loan.user
            results.append({
                "id": str(r.id),
                "tx_hash": r.blockchain_tx_hash or "Pending...",
                "block_number": r.blockchain_block_number,
                "wallet": r.blockchain_wallet_address or "—",
                "network": r.blockchain_network,
                "is_verified": r.is_blockchain_verified,
                "anchored_at": r.blockchain_anchored_at.strftime("%Y-%m-%d %H:%M") if r.blockchain_anchored_at else None,
                "document_hash": r.document_hash[:16] + "..." if r.document_hash else "—",
                "proof_id": r.blockchain_proof_id or "—",
                "amount": float(r.payment.amount),
                "loan_name": r.payment.loan.name,
                "user_email": u.email,
                "user_name": f"{u.first_name} {u.last_name}".strip() or u.email.split("@")[0].capitalize(),
                "created_at": r.created_at.strftime("%Y-%m-%d %H:%M"),
                "status": "Confirmed" if r.is_blockchain_verified else ("Pending" if r.blockchain_tx_hash else "Not Anchored"),
            })
        return Response({"success": True, "count": len(results), "records": results})


# ─────────────────────────────────────────────────────────────────────────────
#  REAL AUDIT LOG
# ─────────────────────────────────────────────────────────────────────────────

class SuperAdminAuditLogView(APIView):
    """
    GET /api/v1/auth/superadmin/audit-log/
    Returns real system-wide audit log from AuditLog model.
    """
    permission_classes = []
    throttle_classes = []

    def get(self, request: Request) -> Response:
        from apps.audit.models import AuditLog
        logs = AuditLog.objects.select_related("user").order_by("-created_at")[:200]
        results = []
        for log in logs:
            results.append({
                "id": str(log.id),
                "action": log.action,
                "action_display": log.get_action_display(),
                "user_email": log.user.email if log.user else "System",
                "user_name": (f"{log.user.first_name} {log.user.last_name}".strip() or log.user.email.split("@")[0].capitalize()) if log.user else "System",
                "target": log.target_resource,
                "ip": log.ip_address or "—",
                "metadata": log.metadata_json,
                "created_at": log.created_at.strftime("%Y-%m-%d %H:%M"),
            })
        return Response({"success": True, "count": len(results), "logs": results})


# ─────────────────────────────────────────────────────────────────────────────
#  CSV EXPORT
# ─────────────────────────────────────────────────────────────────────────────

class SuperAdminCSVExportView(APIView):
    """
    GET /api/v1/auth/superadmin/export/<resource>/
    Downloads a CSV of the requested resource: users | loans | payments | tickets
    """
    permission_classes = []
    throttle_classes = []

    def get(self, request: Request, resource: str) -> Response:
        import csv
        from django.http import HttpResponse
        from apps.loans.models import Loan
        from apps.payments.models import Payment
        from apps.users.models import SupportTicket
        from django.db.models import Sum

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="debtproof_{resource}.csv"'
        writer = csv.writer(response)

        if resource == "users":
            writer.writerow(["Name", "Email", "Status", "Is Staff", "Joined", "Last Login", "Loans", "Total Debt"])
            for u in User.objects.all().order_by("-created_at"):
                debt = Loan.objects.filter(user=u).aggregate(t=Sum("principal_amount"))["t"] or 0
                loans_count = Loan.objects.filter(user=u).count()
                writer.writerow([
                    f"{u.first_name} {u.last_name}".strip() or u.email,
                    u.email,
                    "Active" if u.is_active else "Suspended",
                    u.is_staff,
                    u.created_at.strftime("%Y-%m-%d"),
                    u.last_login.strftime("%Y-%m-%d") if u.last_login else "",
                    loans_count,
                    float(debt),
                ])

        elif resource == "loans":
            writer.writerow(["Loan Name", "User Email", "Type", "Status", "Principal", "Outstanding", "EMI", "Interest Rate", "Lender", "Created"])
            for l in Loan.objects.select_related("user").order_by("-created_at"):
                writer.writerow([
                    l.name, l.user.email, l.loan_type, l.status,
                    float(l.principal_amount),
                    float(l.outstanding_amount) if hasattr(l, "outstanding_amount") else 0,
                    float(l.monthly_emi) if l.monthly_emi else 0,
                    float(l.interest_rate) if l.interest_rate else 0,
                    l.lender_name, l.created_at.strftime("%Y-%m-%d"),
                ])

        elif resource == "payments":
            writer.writerow(["User Email", "Loan Name", "Amount", "Status", "Method", "Reference", "Payment Date"])
            for p in Payment.objects.select_related("loan__user").order_by("-created_at"):
                writer.writerow([
                    p.loan.user.email, p.loan.name, float(p.amount),
                    p.status, p.payment_method,
                    p.reference_number if hasattr(p, "reference_number") else "",
                    p.payment_date.strftime("%Y-%m-%d") if hasattr(p, "payment_date") and p.payment_date else "",
                ])

        elif resource == "tickets":
            writer.writerow(["User Email", "Subject", "Priority", "Status", "Assigned To", "Created", "Resolved At"])
            for t in SupportTicket.objects.select_related("user", "assigned_to__user").order_by("-created_at"):
                writer.writerow([
                    t.user.email if t.user else "",
                    t.subject, t.priority, t.status,
                    t.assigned_to.user.email if t.assigned_to else "",
                    t.created_at.strftime("%Y-%m-%d"),
                    t.resolved_at.strftime("%Y-%m-%d") if t.resolved_at else "",
                ])
        else:
            return Response({"error": f"Unknown resource '{resource}'"}, status=status.HTTP_400_BAD_REQUEST)

        return response




