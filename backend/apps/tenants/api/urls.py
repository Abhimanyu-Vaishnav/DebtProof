"""
DebtProof — Multi-Tenant SaaS URLs
"""
from django.urls import path
from apps.tenants.api import views

urlpatterns = [
    path("organizations/", views.OrganizationListCreateView.as_view(), name="tenant-org-list-create"),
    path("organizations/<uuid:id>/", views.OrganizationDetailView.as_view(), name="tenant-org-detail"),
    path("workspaces/", views.WorkspaceListCreateView.as_view(), name="tenant-workspace-list-create"),
    path("members/", views.OrganizationMemberListAPIView.as_view(), name="tenant-member-list"),
    path("members/<uuid:member_id>/role/", views.UpdateMemberRoleAPIView.as_view(), name="tenant-member-role"),
    path("invitations/", views.InvitationListCreateAPIView.as_view(), name="tenant-invitation-list-create"),
    path("invitations/<str:token>/action/", views.AcceptRejectInvitationAPIView.as_view(), name="tenant-invitation-action"),
    path("feature-flags/", views.FeatureFlagsAPIView.as_view(), name="tenant-feature-flags"),
    path("feature-flags/toggle/", views.FeatureFlagsAPIView.as_view(), name="tenant-feature-flags-toggle"),
    path("billing/plans/", views.SubscriptionPlansAPIView.as_view(), name="tenant-billing-plans"),
    path("billing/subscription/", views.SubscriptionPlansAPIView.as_view(), name="tenant-billing-subscription"),
    path("billing/subscribe/", views.SubscriptionPlansAPIView.as_view(), name="tenant-billing-subscribe"),
    path("billing/invoices/", views.InvoicesHistoryAPIView.as_view(), name="tenant-billing-invoices"),
    path("settings/", views.OrganizationSettingsAPIView.as_view(), name="tenant-settings"),
    path("admin/dashboard/", views.SuperAdminDashboardAPIView.as_view(), name="tenant-super-admin-dashboard"),
]
