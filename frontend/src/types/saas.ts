/**
 * DebtProof — Multi-Tenant SaaS TypeScript Definitions
 */

export type TenantRole = "owner" | "admin" | "manager" | "member" | "viewer";

export type WorkspaceType = "personal" | "family" | "business" | "investment" | "rental" | "startup";

export type InvitationStatus = "pending" | "accepted" | "rejected" | "expired";

export type SubscriptionPlanCode = "free" | "basic" | "premium" | "business" | "enterprise";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  workspace_type: WorkspaceType;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    avatar?: string;
  };
  role: TenantRole;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner: {
    id: string;
    email: string;
    full_name: string;
  };
  logo?: string;
  timezone: string;
  currency: string;
  is_active: boolean;
  members_count: number;
  workspaces: Workspace[];
  created_at: string;
  updated_at: string;
}

export interface OrganizationInvitation {
  id: string;
  email: string;
  role: TenantRole;
  invited_by: {
    email: string;
    full_name: string;
  };
  token: string;
  status: InvitationStatus;
  expires_at: string;
  created_at: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  default_enabled: boolean;
  is_enabled: boolean;
}

export interface Plan {
  id: string;
  code: SubscriptionPlanCode;
  name: string;
  price_monthly: number;
  price_yearly: number;
  max_loans: number;
  max_storage_bytes: number;
  max_reports: number;
  max_ai_requests: number;
  max_blockchain_proofs: number;
  max_team_members: number;
  allow_api_access: boolean;
}

export interface OrganizationSubscription {
  id: string;
  plan: Plan;
  status: "active" | "trialing" | "past_due" | "canceled";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface UsageTracker {
  id: string;
  metric: string;
  current_value: number;
  reset_date?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: "draft" | "open" | "paid" | "uncollectible" | "void";
  billing_date: string;
  due_date: string;
  items_json: Array<{ description: string; amount: number }>;
}

export interface BillingTransaction {
  id: string;
  transaction_type: "payment" | "refund" | "credit";
  amount: number;
  payment_method: string;
  reference_id: string;
  status: string;
  timestamp: string;
}

export interface OrganizationSetting {
  require_2fa: boolean;
  allowed_email_domains: string;
  notify_on_new_member: boolean;
  notify_on_payment: boolean;
  custom_branding_json: Record<string, any>;
}

export interface AuditLog {
  id: string;
  user_email: string;
  action: string;
  target_resource: string;
  ip_address?: string;
  user_agent?: string;
  metadata_json: Record<string, any>;
  created_at: string;
}
