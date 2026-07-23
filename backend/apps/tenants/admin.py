"""
DebtProof — Multi-Tenant SaaS Admin Registration
"""
from django.contrib import admin
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
)


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "owner", "currency", "timezone", "is_active", "created_at"]
    search_fields = ["name", "slug", "owner__email"]


@admin.register(OrganizationMember)
class OrganizationMemberAdmin(admin.ModelAdmin):
    list_display = ["organization", "user", "role", "created_at"]
    list_filter = ["role"]
    search_fields = ["organization__name", "user__email"]


@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ["name", "organization", "workspace_type", "slug", "created_at"]
    list_filter = ["workspace_type"]
    search_fields = ["name", "organization__name"]


@admin.register(OrganizationInvitation)
class OrganizationInvitationAdmin(admin.ModelAdmin):
    list_display = ["email", "organization", "role", "status", "expires_at"]
    list_filter = ["status", "role"]


@admin.register(FeatureFlag)
class FeatureFlagAdmin(admin.ModelAdmin):
    list_display = ["name", "key", "default_enabled"]


@admin.register(OrganizationFeatureFlag)
class OrganizationFeatureFlagAdmin(admin.ModelAdmin):
    list_display = ["organization", "feature_flag", "is_enabled"]


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "price_monthly", "max_loans", "max_team_members"]


@admin.register(OrganizationSubscription)
class OrganizationSubscriptionAdmin(admin.ModelAdmin):
    list_display = ["organization", "plan", "status", "current_period_end"]
    list_filter = ["status"]


@admin.register(UsageTracker)
class UsageTrackerAdmin(admin.ModelAdmin):
    list_display = ["organization", "metric", "current_value"]


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ["invoice_number", "organization", "amount_due", "status", "billing_date"]
    list_filter = ["status"]


@admin.register(BillingTransaction)
class BillingTransactionAdmin(admin.ModelAdmin):
    list_display = ["invoice", "organization", "amount", "transaction_type", "status", "timestamp"]


@admin.register(OrganizationSetting)
class OrganizationSettingAdmin(admin.ModelAdmin):
    list_display = ["organization", "require_2fa", "notify_on_payment"]
