"""
DebtProof — Tenant Resolution Middleware
Intercepts HTTP requests to extract organization and workspace headers.
"""
from typing import Callable
from django.http import HttpRequest, HttpResponse
from apps.tenants.models import Organization, OrganizationMember, Workspace, WorkspaceType, Plan, OrganizationSubscription, SubscriptionPlanCode
from django.utils import timezone
from datetime import timedelta


class TenantMiddleware:
    """
    Middleware that populates `request.organization` and `request.workspace`.
    Ensures single-user fallback and auto-provisions default Personal Organization if needed.
    """

    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        request.organization = None
        request.workspace = None

        if hasattr(request, "user") and request.user.is_authenticated:
            org_header = request.headers.get("X-Organization-ID") or request.headers.get("X-Organization-Slug")
            ws_header = request.headers.get("X-Workspace-ID") or request.headers.get("X-Workspace-Slug")

            organization = None

            if org_header:
                organization = Organization.objects.filter(
                    memberships__user=request.user
                ).filter(
                    id=org_header if len(org_header) == 36 and "-" in org_header else None
                ).first() or Organization.objects.filter(
                    memberships__user=request.user, slug=org_header
                ).first()

            if not organization:
                first_membership = OrganizationMember.objects.filter(user=request.user).select_related("organization").first()
                if first_membership:
                    organization = first_membership.organization
                else:
                    # Auto-provision default Personal Organization for user
                    organization = self._provision_default_tenant(request.user)

            request.organization = organization

            workspace = None
            if organization:
                if ws_header:
                    workspace = Workspace.objects.filter(
                        organization=organization,
                        id=ws_header if len(ws_header) == 36 and "-" in ws_header else None
                    ).first() or Workspace.objects.filter(
                        organization=organization, slug=ws_header
                    ).first()

                if not workspace:
                    workspace = Workspace.objects.filter(organization=organization).first()
                    if not workspace:
                        workspace = Workspace.objects.create(
                            organization=organization,
                            name="Personal Workspace",
                            slug="personal",
                            workspace_type=WorkspaceType.PERSONAL,
                            created_by=request.user,
                        )

            request.workspace = workspace

        return self.get_response(request)

    def _provision_default_tenant(self, user) -> Organization:
        """Helper to create a default Personal Organization for new users."""
        slug_base = user.email.split("@")[0].lower()
        slug = f"{slug_base}-org"
        count = 1
        while Organization.objects.filter(slug=slug).exists():
            slug = f"{slug_base}-org-{count}"
            count += 1

        org_name = f"{user.first_name}'s Organization" if user.first_name else f"{slug_base.capitalize()}'s Space"
        org = Organization.objects.create(
            name=org_name,
            slug=slug,
            owner=user,
        )

        OrganizationMember.objects.create(
            organization=org,
            user=user,
            role="owner",
        )

        # Default free plan
        free_plan, _ = Plan.objects.get_or_create(
            code=SubscriptionPlanCode.FREE,
            defaults={"name": "Free Plan", "price_monthly": 0, "price_yearly": 0}
        )
        OrganizationSubscription.objects.create(
            organization=org,
            plan=free_plan,
            status="active",
            current_period_start=timezone.now(),
            current_period_end=timezone.now() + timedelta(days=3650),
        )

        return org
