"""
DebtProof — Multi-Tenant SaaS Views
REST API views for Organizations, Workspaces, RBAC Roles, Invitations,
Feature Flags, Subscription Plans, Usage Limits, Billing, Settings, and Super Admin.
"""
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import generics, status, views
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from apps.audit.services import AuditLogger
from apps.users.models import User
from apps.tenants.models import (
    Organization,
    OrganizationMember,
    Workspace,
    OrganizationInvitation,
    FeatureFlag,
    OrganizationFeatureFlag,
    Plan,
    OrganizationSubscription,
    UsageTracker,
    Invoice,
    BillingTransaction,
    OrganizationSetting,
    TenantRole,
    InvitationStatus,
    SubscriptionPlanCode,
)
from apps.tenants.api.serializers import (
    OrganizationSerializer,
    OrganizationMemberSerializer,
    WorkspaceSerializer,
    OrganizationInvitationSerializer,
    FeatureFlagSerializer,
    PlanSerializer,
    OrganizationSubscriptionSerializer,
    UsageTrackerSerializer,
    InvoiceSerializer,
    BillingTransactionSerializer,
    OrganizationSettingSerializer,
)


# ── 1. ORGANIZATIONS ──────────────────────────────────────────
class OrganizationListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/tenants/organizations/  — List user's organizations
    POST /api/v1/tenants/organizations/  — Create a new Organization
    """
    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        return Organization.objects.filter(memberships__user=self.request.user).distinct()

    def perform_create(self, serializer):
        name = serializer.validated_data["name"]
        slug_base = slugify(name) or "org"
        slug = slug_base
        count = 1
        while Organization.objects.filter(slug=slug).exists():
            slug = f"{slug_base}-{count}"
            count += 1

        org = serializer.save(owner=self.request.user, slug=slug)
        OrganizationMember.objects.create(organization=org, user=self.request.user, role=TenantRole.OWNER)

        # Default free plan & settings
        free_plan, _ = Plan.objects.get_or_create(code=SubscriptionPlanCode.FREE, defaults={"name": "Free Plan"})
        OrganizationSubscription.objects.create(
            organization=org,
            plan=free_plan,
            status="active",
            current_period_start=timezone.now(),
            current_period_end=timezone.now() + timedelta(days=3650),
        )
        OrganizationSetting.objects.create(organization=org)
        Workspace.objects.create(organization=org, name="Personal Workspace", slug="personal", created_by=self.request.user)

        AuditLogger.log(
            action="setting_updated",
            user=self.request.user,
            organization_id=org.id,
            target_resource=f"Organization {org.name}",
            request=self.request,
            metadata={"name": org.name, "slug": org.slug},
        )


class OrganizationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/v1/tenants/organizations/{id}/"""
    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationSerializer
    lookup_field = "id"

    def get_queryset(self):
        return Organization.objects.filter(memberships__user=self.request.user)


# ── 2. WORKSPACES ──────────────────────────────────────────────
class WorkspaceListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/v1/tenants/workspaces/"""
    permission_classes = [IsAuthenticated]
    serializer_class = WorkspaceSerializer

    def get_queryset(self):
        org = getattr(self.request, "organization", None)
        if not org:
            return Workspace.objects.none()
        return Workspace.objects.filter(organization=org)

    def perform_create(self, serializer):
        org = getattr(self.request, "organization", None)
        if not org:
            raise serializers.ValidationError("Active organization context required.")
        name = serializer.validated_data["name"]
        slug = slugify(name) or "ws"
        serializer.save(organization=org, slug=slug, created_by=self.request.user)


# ── 3. TEAM MEMBERS & ROLES ────────────────────────────────────
class OrganizationMemberListAPIView(views.APIView):
    """GET /api/v1/tenants/members/ — List members of current active organization"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = getattr(request, "organization", None)
        if not org:
            return Response({"success": False, "message": "No active organization"}, status=400)
        members = OrganizationMember.objects.filter(organization=org).select_related("user")
        serializer = OrganizationMemberSerializer(members, many=True)
        return Response({"success": True, "members": serializer.data})


class UpdateMemberRoleAPIView(views.APIView):
    """PATCH /api/v1/tenants/members/{member_id}/role/ — Change user RBAC role"""
    permission_classes = [IsAuthenticated]

    def patch(self, request, member_id):
        org = getattr(request, "organization", None)
        if not org:
            return Response({"success": False, "message": "No active organization"}, status=400)

        # Ensure current user is Owner or Admin
        my_membership = OrganizationMember.objects.filter(organization=org, user=request.user).first()
        if not my_membership or my_membership.role not in [TenantRole.OWNER, TenantRole.ADMIN]:
            return Response({"success": False, "message": "Permission denied. Only Owner or Admin can manage roles."}, status=403)

        target_member = OrganizationMember.objects.filter(id=member_id, organization=org).first()
        if not target_member:
            return Response({"success": False, "message": "Member not found."}, status=404)

        new_role = request.data.get("role")
        if new_role not in TenantRole.values:
            return Response({"success": False, "message": f"Invalid role. Choices: {TenantRole.values}"}, status=400)

        old_role = target_member.role
        target_member.role = new_role
        target_member.save()

        AuditLogger.log(
            action="role_changed",
            user=request.user,
            organization_id=org.id,
            target_resource=target_member.user.email,
            request=request,
            metadata={"old_role": old_role, "new_role": new_role},
        )

        return Response({"success": True, "message": f"Role updated to {new_role}."})


# ── 4. INVITATIONS ─────────────────────────────────────────────
class InvitationListCreateAPIView(views.APIView):
    """
    GET  /api/v1/tenants/invitations/ — List pending invitations
    POST /api/v1/tenants/invitations/ — Invite a team member via email
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = getattr(request, "organization", None)
        if not org:
            return Response({"success": False, "invitations": []})
        invites = OrganizationInvitation.objects.filter(organization=org).select_related("invited_by")
        serializer = OrganizationInvitationSerializer(invites, many=True)
        return Response({"success": True, "invitations": serializer.data})

    def post(self, request):
        org = getattr(request, "organization", None)
        if not org:
            return Response({"success": False, "message": "Active organization context required."}, status=400)

        email = request.data.get("email", "").strip().lower()
        role = request.data.get("role", TenantRole.MEMBER)

        if not email:
            return Response({"success": False, "message": "Email field is required."}, status=400)

        # Check if already a member
        if OrganizationMember.objects.filter(organization=org, user__email=email).exists():
            return Response({"success": False, "message": f"{email} is already a member of this organization."}, status=400)

        invite = OrganizationInvitation.objects.create(
            organization=org,
            email=email,
            role=role,
            invited_by=request.user,
            expires_at=timezone.now() + timedelta(days=7),
        )

        AuditLogger.log(
            action="invitation_sent",
            user=request.user,
            organization_id=org.id,
            target_resource=email,
            request=request,
            metadata={"role": role},
        )

        return Response({"success": True, "message": f"Invitation sent to {email}.", "invitation": OrganizationInvitationSerializer(invite).data})


class AcceptRejectInvitationAPIView(views.APIView):
    """POST /api/v1/tenants/invitations/{token}/action/ — Accept or Reject Invitation"""
    permission_classes = [IsAuthenticated]

    def post(self, request, token):
        action = request.data.get("action", "accept")  # "accept" or "reject"
        invite = OrganizationInvitation.objects.filter(token=token, status=InvitationStatus.PENDING).first()

        if not invite or not invite.is_valid():
            return Response({"success": False, "message": "Invitation is invalid or expired."}, status=400)

        if action == "accept":
            invite.status = InvitationStatus.ACCEPTED
            invite.save()

            OrganizationMember.objects.get_or_create(
                organization=invite.organization,
                user=request.user,
                defaults={"role": invite.role},
            )

            AuditLogger.log(
                action="invitation_accepted",
                user=request.user,
                organization_id=invite.organization.id,
                request=request,
            )
            return Response({"success": True, "message": "Invitation accepted. You are now a team member."})
        else:
            invite.status = InvitationStatus.REJECTED
            invite.save()
            return Response({"success": True, "message": "Invitation rejected."})


# ── 5. FEATURE FLAGS ────────────────────────────────────────────
class FeatureFlagsAPIView(views.APIView):
    """
    GET  /api/v1/tenants/feature-flags/ — Get active feature flags
    POST /api/v1/tenants/feature-flags/toggle/ — Toggle feature flag override for Organization
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        flags = FeatureFlag.objects.all()
        if not flags.exists():
            # Seed default SaaS feature flags
            default_flags = [
                ("budget", "Budget & Cash Flow Planner", "Enables intelligent monthly budget planner."),
                ("ai", "AI Debt Advisor", "Enables AI payoff coach & interactive simulator."),
                ("investments", "Investments & Wealth Tracker", "Enables wealth & CAGR compound predictor."),
                ("marketplace", "P2P Web3 Marketplace", "Enables P2P borrowing & Monad smart contract escrow."),
                ("reports", "Bank-Grade PDF Reports", "Enables official PDF audit reports generator."),
                ("blockchain", "Monad Blockchain Anchoring", "Enables SHA-256 cryptographic proof storage."),
            ]
            for key, name, desc in default_flags:
                FeatureFlag.objects.create(key=key, name=name, description=desc, default_enabled=True)
            flags = FeatureFlag.objects.all()

        serializer = FeatureFlagSerializer(flags, many=True, context={"request": request})
        return Response({"success": True, "feature_flags": serializer.data})

    def post(self, request):
        org = getattr(request, "organization", None)
        if not org:
            return Response({"success": False, "message": "No active organization"}, status=400)

        flag_key = request.data.get("key")
        is_enabled = request.data.get("is_enabled", True)

        try:
            flag = FeatureFlag.objects.get(key=flag_key)
        except FeatureFlag.DoesNotExist:
            return Response({"success": False, "message": "Feature flag key not found."}, status=404)

        override, _ = OrganizationFeatureFlag.objects.get_or_create(organization=org, feature_flag=flag)
        override.is_enabled = is_enabled
        override.save()

        AuditLogger.log(
            action="feature_flag_toggled",
            user=request.user,
            organization_id=org.id,
            target_resource=flag.name,
            request=request,
            metadata={"is_enabled": is_enabled},
        )

        return Response({"success": True, "message": f"Feature '{flag.name}' set to {is_enabled}."})


# ── 6. SUBSCRIPTION & BILLING ───────────────────────────────────
class SubscriptionPlansAPIView(views.APIView):
    """
    GET /api/v1/tenants/billing/plans/ — List available plans
    GET /api/v1/tenants/billing/subscription/ — Current subscription status & usage
    POST /api/v1/tenants/billing/subscribe/ — Change plan (Upgrade/Downgrade/Cancel)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Ensure default plans exist
        if not Plan.objects.exists():
            Plan.objects.create(code="free", name="Free Plan", price_monthly=0, max_loans=5, max_storage_bytes=104857600, max_reports=10, max_ai_requests=20, max_blockchain_proofs=5, max_team_members=1)
            Plan.objects.create(code="basic", name="Basic Plan", price_monthly=499, max_loans=25, max_storage_bytes=1073741824, max_reports=100, max_ai_requests=200, max_blockchain_proofs=50, max_team_members=3)
            Plan.objects.create(code="premium", name="Premium Plan", price_monthly=999, max_loans=-1, max_storage_bytes=10737418240, max_reports=-1, max_ai_requests=-1, max_blockchain_proofs=-1, max_team_members=10, allow_api_access=True)
            Plan.objects.create(code="business", name="Business Plan", price_monthly=2499, max_loans=-1, max_storage_bytes=107374182400, max_reports=-1, max_ai_requests=-1, max_blockchain_proofs=-1, max_team_members=50, allow_api_access=True)

        plans = Plan.objects.all().order_by("price_monthly")
        org = getattr(request, "organization", None)
        current_sub = getattr(org, "subscription", None) if org else None

        return Response({
            "success": True,
            "plans": PlanSerializer(plans, many=True).data,
            "current_subscription": OrganizationSubscriptionSerializer(current_sub).data if current_sub else None,
        })

    def post(self, request):
        org = getattr(request, "organization", None)
        if not org:
            return Response({"success": False, "message": "No active organization"}, status=400)

        plan_code = request.data.get("plan_code")
        try:
            plan = Plan.objects.get(code=plan_code)
        except Plan.DoesNotExist:
            return Response({"success": False, "message": "Invalid plan code."}, status=404)

        sub, _ = OrganizationSubscription.objects.get_or_create(
            organization=org,
            defaults={"plan": plan, "status": "active", "current_period_end": timezone.now() + timedelta(days=30)},
        )
        old_plan = sub.plan.name
        sub.plan = plan
        sub.status = "active"
        sub.current_period_end = timezone.now() + timedelta(days=30)
        sub.save()

        # Create mock invoice & transaction
        inv = Invoice.objects.create(
            organization=org,
            subscription=sub,
            invoice_number=f"INV-{uuid.uuid4().hex[:8].upper()}",
            amount_due=plan.price_monthly,
            amount_paid=plan.price_monthly,
            currency=org.currency,
            status="paid",
            due_date=timezone.now(),
            items_json=[{"description": f"Subscription to {plan.name}", "amount": float(plan.price_monthly)}],
        )

        BillingTransaction.objects.create(
            organization=org,
            invoice=inv,
            amount=plan.price_monthly,
            payment_method="card",
            reference_id=f"TXN-{uuid.uuid4().hex[:10].upper()}",
            status="succeeded",
        )

        AuditLogger.log(
            action="plan_changed",
            user=request.user,
            organization_id=org.id,
            target_resource=plan.name,
            request=request,
            metadata={"from_plan": old_plan, "to_plan": plan.name},
        )

        return Response({
            "success": True,
            "message": f"Successfully updated subscription to {plan.name}.",
            "subscription": OrganizationSubscriptionSerializer(sub).data,
        })


class InvoicesHistoryAPIView(views.APIView):
    """GET /api/v1/tenants/billing/invoices/ — List billing invoices and transactions"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = getattr(request, "organization", None)
        if not org:
            return Response({"success": False, "invoices": []})
        invoices = Invoice.objects.filter(organization=org)
        txs = BillingTransaction.objects.filter(organization=org)
        return Response({
            "success": True,
            "invoices": InvoiceSerializer(invoices, many=True).data,
            "transactions": BillingTransactionSerializer(txs, many=True).data,
        })


# ── 7. ORGANIZATION SETTINGS ──────────────────────────────────
class OrganizationSettingsAPIView(views.APIView):
    """GET/PATCH /api/v1/tenants/settings/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org = getattr(request, "organization", None)
        if not org:
            return Response({"success": False, "message": "No active organization"}, status=400)
        settings_obj, _ = OrganizationSetting.objects.get_or_create(organization=org)
        return Response({
            "success": True,
            "organization": OrganizationSerializer(org).data,
            "settings": OrganizationSettingSerializer(settings_obj).data,
        })

    def patch(self, request):
        org = getattr(request, "organization", None)
        if not org:
            return Response({"success": False, "message": "No active organization"}, status=400)

        settings_obj, _ = OrganizationSetting.objects.get_or_create(organization=org)
        serializer = OrganizationSettingSerializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Update org level fields if provided
        if "name" in request.data:
            org.name = request.data["name"]
        if "currency" in request.data:
            org.currency = request.data["currency"]
        if "timezone" in request.data:
            org.timezone = request.data["timezone"]
        org.save()

        return Response({"success": True, "message": "Settings updated successfully."})


# ── 8. SUPER ADMIN SAAS DASHBOARD ──────────────────────────────
class SuperAdminDashboardAPIView(views.APIView):
    """GET /api/v1/admin/dashboard/ — SaaS Super Admin Global Statistics"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_orgs = Organization.objects.count()
        total_users = User.objects.count()
        active_subs = OrganizationSubscription.objects.filter(status="active").count()
        mrr = sum(sub.plan.price_monthly for sub in OrganizationSubscription.objects.filter(status="active").select_related("plan"))

        return Response({
            "success": True,
            "stats": {
                "total_organizations": total_orgs,
                "total_users": total_users,
                "active_subscriptions": active_subs,
                "mrr": float(mrr),
                "total_workspaces": Workspace.objects.count(),
                "total_invoices": Invoice.objects.count(),
            },
            "recent_organizations": OrganizationSerializer(Organization.objects.all().order_by("-created_at")[:10], many=True).data,
        })
