"""
DebtProof — Multi-Tenant RBAC Permissions and Guards
Granular role and feature flag enforcement for REST API endpoints.
"""
from rest_framework.permissions import BasePermission
from apps.tenants.models import OrganizationMember, TenantRole, OrganizationFeatureFlag, FeatureFlag, UsageTracker, OrganizationSubscription


class IsOrganizationMember(BasePermission):
    """Allows access if user is a member of the current organization."""

    def has_permission(self, request, view) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        tenant_org = getattr(request, "organization", None)
        if not tenant_org:
            return True  # If tenant context not explicitly set, default auth applies
        return OrganizationMember.objects.filter(organization=tenant_org, user=request.user).exists()


class IsOrganizationAdminOrOwner(BasePermission):
    """Allows access if user has OWNER or ADMIN role in current organization."""

    def has_permission(self, request, view) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        tenant_org = getattr(request, "organization", None)
        if not tenant_org:
            return True
        return OrganizationMember.objects.filter(
            organization=tenant_org,
            user=request.user,
            role__in=[TenantRole.OWNER, TenantRole.ADMIN],
        ).exists()


class IsOrganizationOwner(BasePermission):
    """Allows access only if user is OWNER of current organization."""

    def has_permission(self, request, view) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        tenant_org = getattr(request, "organization", None)
        if not tenant_org:
            return True
        return OrganizationMember.objects.filter(
            organization=tenant_org,
            user=request.user,
            role=TenantRole.OWNER,
        ).exists()


def check_feature_flag(organization, flag_key: str) -> bool:
    """Evaluates whether a feature flag is enabled for an Organization."""
    try:
        flag = FeatureFlag.objects.get(key=flag_key)
        override = OrganizationFeatureFlag.objects.filter(organization=organization, feature_flag=flag).first()
        if override is not None:
            return override.is_enabled
        return flag.default_enabled
    except FeatureFlag.DoesNotExist:
        return True


def check_usage_limit(organization, metric: str) -> tuple[bool, str]:
    """Checks whether an Organization has exceeded its Subscription Plan limit."""
    try:
        sub = getattr(organization, "subscription", None)
        if not sub or not sub.plan:
            return True, ""

        plan = sub.plan
        limit_map = {
            "loans": plan.max_loans,
            "storage_bytes": plan.max_storage_bytes,
            "reports": plan.max_reports,
            "ai_requests": plan.max_ai_requests,
            "blockchain_proofs": plan.max_blockchain_proofs,
            "team_members": plan.max_team_members,
        }

        max_limit = limit_map.get(metric, -1)
        if max_limit == -1:  # Unlimited
            return True, ""

        tracker = UsageTracker.objects.filter(organization=organization, metric=metric).first()
        current_val = tracker.current_value if tracker else 0

        if current_val >= max_limit:
            return False, f"Quota exceeded for '{metric}'. Your {plan.name} plan allows up to {max_limit}."

        return True, ""
    except Exception:
        return True, ""
