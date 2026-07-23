/**
 * DebtProof — Multi-Tenant Service Layer
 */

import apiClient from "@/services/api";
import {
  Organization,
  Workspace,
  OrganizationMember,
  OrganizationInvitation,
  FeatureFlag,
  Plan,
  OrganizationSubscription,
  Invoice,
  BillingTransaction,
  OrganizationSetting,
  AuditLog,
  TenantRole,
} from "@/types/saas";

export const tenantsService = {
  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    try {
      const res = await apiClient.get("/tenants/organizations/");
      return res.data.results || res.data || [];
    } catch {
      return [];
    }
  },

  async createOrganization(data: { name: string; currency?: string; timezone?: string }): Promise<Organization> {
    const res = await apiClient.post("/tenants/organizations/", data);
    return res.data;
  },

  async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization> {
    const res = await apiClient.patch(`/tenants/organizations/${id}/`, data);
    return res.data;
  },

  // Workspaces
  async getWorkspaces(): Promise<Workspace[]> {
    try {
      const res = await apiClient.get("/tenants/workspaces/");
      return res.data.results || res.data || [];
    } catch {
      return [];
    }
  },

  async createWorkspace(data: { name: string; workspace_type: string; description?: string }): Promise<Workspace> {
    const res = await apiClient.post("/tenants/workspaces/", data);
    return res.data;
  },

  // Team Members
  async getMembers(): Promise<OrganizationMember[]> {
    try {
      const res = await apiClient.get("/tenants/members/");
      return res.data.members || [];
    } catch {
      return [];
    }
  },

  async updateMemberRole(memberId: string, role: TenantRole): Promise<void> {
    await apiClient.patch(`/tenants/members/${memberId}/role/`, { role });
  },

  // Invitations
  async getInvitations(): Promise<OrganizationInvitation[]> {
    try {
      const res = await apiClient.get("/tenants/invitations/");
      return res.data.invitations || [];
    } catch {
      return [];
    }
  },

  async sendInvitation(email: string, role: TenantRole): Promise<OrganizationInvitation> {
    const res = await apiClient.post("/tenants/invitations/", { email, role });
    return res.data.invitation;
  },

  async respondInvitation(token: string, action: "accept" | "reject"): Promise<void> {
    await apiClient.post(`/tenants/invitations/${token}/action/`, { action });
  },

  // Feature Flags
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    try {
      const res = await apiClient.get("/tenants/feature-flags/");
      return res.data.feature_flags || [];
    } catch {
      return [];
    }
  },

  async toggleFeatureFlag(key: string, is_enabled: boolean): Promise<void> {
    await apiClient.post("/tenants/feature-flags/toggle/", { key, is_enabled });
  },

  // Subscription & Billing
  async getBillingPlans(): Promise<{ plans: Plan[]; current_subscription: OrganizationSubscription | null }> {
    try {
      const res = await apiClient.get("/tenants/billing/plans/");
      return {
        plans: res.data.plans || [],
        current_subscription: res.data.current_subscription || null,
      };
    } catch {
      return { plans: [], current_subscription: null };
    }
  },

  async subscribePlan(planCode: string): Promise<OrganizationSubscription> {
    const res = await apiClient.post("/tenants/billing/subscribe/", { plan_code: planCode });
    return res.data.subscription;
  },

  async getInvoices(): Promise<{ invoices: Invoice[]; transactions: BillingTransaction[] }> {
    try {
      const res = await apiClient.get("/tenants/billing/invoices/");
      return {
        invoices: res.data.invoices || [],
        transactions: res.data.transactions || [],
      };
    } catch {
      return { invoices: [], transactions: [] };
    }
  },

  // Settings
  async getSettings(): Promise<{ organization: Organization; settings: OrganizationSetting }> {
    const res = await apiClient.get("/tenants/settings/");
    return res.data;
  },

  async updateSettings(data: Partial<OrganizationSetting> & { name?: string; currency?: string; timezone?: string }): Promise<void> {
    await apiClient.patch("/tenants/settings/", data);
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const res = await apiClient.get("/audit/logs/");
      return res.data.results || res.data || [];
    } catch {
      return [];
    }
  },

  // Super Admin
  async getAdminDashboard(): Promise<any> {
    try {
      const res = await apiClient.get("/tenants/admin/dashboard/");
      return res.data;
    } catch {
      return null;
    }
  },
};
