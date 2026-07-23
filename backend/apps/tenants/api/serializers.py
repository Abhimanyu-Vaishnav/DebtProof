"""
DebtProof — Multi-Tenant SaaS Serializers
"""
from rest_framework import serializers
from apps.tenants.models import (
    Organization,
    OrganizationMember,
    Workspace,
    WorkspaceMember,
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
)
from apps.users.models import User


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "full_name", "avatar"]


class OrganizationMemberSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = OrganizationMember
        fields = ["id", "user", "role", "status", "last_login_at", "created_at"]


class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = ["id", "name", "slug", "workspace_type", "description", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class OrganizationSerializer(serializers.ModelSerializer):
    owner = UserBasicSerializer(read_only=True)
    members_count = serializers.SerializerMethodField()
    workspaces = WorkspaceSerializer(many=True, read_only=True)

    class Meta:
        model = Organization
        fields = [
            "id",
            "name",
            "slug",
            "owner",
            "logo",
            "timezone",
            "currency",
            "is_active",
            "members_count",
            "workspaces",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "slug", "created_at", "updated_at"]

    def get_members_count(self, obj: Organization) -> int:
        return obj.memberships.count()


class OrganizationInvitationSerializer(serializers.ModelSerializer):
    invited_by = UserBasicSerializer(read_only=True)
    workspace_name = serializers.SerializerMethodField()

    class Meta:
        model = OrganizationInvitation
        fields = [
            "id",
            "email",
            "role",
            "workspace",
            "workspace_name",
            "invited_by",
            "token",
            "status",
            "expires_at",
            "canceled_at",
            "created_at",
        ]
        read_only_fields = ["id", "token", "status", "expires_at", "created_at"]

    def get_workspace_name(self, obj: OrganizationInvitation) -> str:
        return obj.workspace.name if obj.workspace else "All Workspaces"


class FeatureFlagSerializer(serializers.ModelSerializer):
    is_enabled = serializers.SerializerMethodField()

    class Meta:
        model = FeatureFlag
        fields = ["id", "key", "name", "description", "default_enabled", "is_enabled"]

    def get_is_enabled(self, obj: FeatureFlag) -> bool:
        request = self.context.get("request")
        if request and hasattr(request, "organization") and request.organization:
            override = OrganizationFeatureFlag.objects.filter(
                organization=request.organization, feature_flag=obj
            ).first()
            if override is not None:
                return override.is_enabled
        return obj.default_enabled


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = [
            "id",
            "code",
            "name",
            "price_monthly",
            "price_yearly",
            "is_recommended",
            "is_popular",
            "is_active",
            "is_archived",
            "savings_badge",
            "max_loans",
            "max_storage_bytes",
            "max_reports",
            "max_ai_requests",
            "max_blockchain_proofs",
            "max_team_members",
            "workspace_limit",
            "allow_api_access",
            "has_priority_support",
            "has_custom_branding",
            "features_json",
        ]


class OrganizationSubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)

    class Meta:
        model = OrganizationSubscription
        fields = [
            "id",
            "plan",
            "status",
            "current_period_start",
            "current_period_end",
            "cancel_at_period_end",
        ]


class UsageTrackerSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsageTracker
        fields = ["id", "metric", "current_value", "reset_date"]


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = [
            "id",
            "invoice_number",
            "amount_due",
            "amount_paid",
            "currency",
            "status",
            "billing_date",
            "due_date",
            "items_json",
        ]


class BillingTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillingTransaction
        fields = [
            "id",
            "transaction_type",
            "amount",
            "payment_method",
            "reference_id",
            "status",
            "timestamp",
        ]


class OrganizationSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationSetting
        fields = [
            "require_2fa",
            "allowed_email_domains",
            "notify_on_new_member",
            "notify_on_payment",
            "custom_branding_json",
        ]
