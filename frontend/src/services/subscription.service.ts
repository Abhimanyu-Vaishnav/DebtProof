import apiClient from "./api";

export interface PlanFeature {
  key: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  is_core?: boolean;
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  price_monthly: string | number;
  price_yearly: string | number;
  is_recommended: boolean;
  is_popular: boolean;
  is_active: boolean;
  is_archived: boolean;
  savings_badge?: string;
  max_loans: number;
  max_storage_bytes: number;
  max_reports: number;
  max_ai_requests: number;
  max_blockchain_proofs: number;
  max_team_members: number;
  workspace_limit: number;
  allow_api_access: boolean;
  has_priority_support: boolean;
  has_custom_branding: boolean;
  features_json: string[];
}

export interface SubscriptionStatus {
  id: string;
  plan: Plan;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface SubscriptionOverviewResponse {
  success: boolean;
  plans: Plan[];
  current_subscription: SubscriptionStatus | null;
  allowed_features: string[];
  usage_stats: {
    loans_count: number;
    ai_requests_count: number;
    blockchain_proofs_count: number;
    storage_bytes_used: number;
  };
}

export const DEFAULT_CATALOG: PlanFeature[] = [
  { key: "my_loans", name: "Bank Loan Tracking", category: "Core", description: "Track multiple EMI loans, interest, and payoff schedules.", icon: "💳", is_core: true },
  { key: "credit_cards", name: "Credit Card Balances", category: "Core", description: "Monitor credit card utilization and interest charges.", icon: "💳", is_core: true },
  { key: "budget", name: "Monthly Budget Planner", category: "Core", description: "Smart income vs debt expense allocation planner.", icon: "📊", is_core: true },
  { key: "payments_log", name: "Manual Payments Log", category: "Core", description: "Record manual EMI transactions and receipt uploads.", icon: "📝", is_core: true },
  { key: "investments", name: "Investments & CAGR Predictor", category: "Growth", description: "Wealth simulator and compound yield engine.", icon: "📈" },
  { key: "payoff_quest", name: "AI Payoff Quest Simulator", category: "AI & Tools", description: "Snowball vs Avalanche debt destruction simulator.", icon: "🎮" },
  { key: "statement_parser", name: "AI Statement Parser", category: "AI & Tools", description: "Parse CIBIL & PDF credit statements automatically.", icon: "📄" },
  { key: "activity_log", name: "Audit Trail & Activity Log", category: "Security", description: "Immutable user activity audit trail.", icon: "📜" },
  { key: "reports_export", name: "Financial PDF Exports", category: "Reports", description: "Download bank-grade zero-debt PDF discharge reports.", icon: "📥" },
  { key: "joint_workspace", name: "Joint Debt Workspace", category: "Collaboration", description: "Collaborative loan tracking for couples & business partners.", icon: "👥" },
  { key: "refinance_studio", name: "Refinance Savings Studio", category: "Growth", description: "Identify lower interest rate balance transfer opportunities.", icon: "⚡" },
  { key: "auto_saver", name: "Micro Auto-Saver Vault", category: "Automation", description: "Automated spare-change round-up debt payoff accelerator.", icon: "🏦" },
  { key: "zk_proofs", name: "Zero-Knowledge Credit Proofs", category: "Web3", description: "Generate Monad zero-knowledge solvency proof certificates.", icon: "🛡️" },
  { key: "receipt_anchoring", name: "Monad Blockchain Anchoring", category: "Web3", description: "Anchor EMI payment receipts on Monad SHA-256 ledger.", icon: "🔗" },
  { key: "p2p_market", name: "P2P Settlement & Waiver Desk", category: "Marketplace", description: "P2P debt settlement & escrow smart contract waiver desk.", icon: "🤝" },
  { key: "ai_coach", name: "AI Debt Destroyer Assistant", category: "AI & Tools", description: "24/7 AI financial advisor & debt reduction assistant.", icon: "🤖" },
  { key: "api_access", name: "Developer REST API Access", category: "Enterprise", description: "Programmatic API access & webhooks integration.", icon: "⚡" },
  { key: "whitelabel_custom_domain", name: "Whitelabel Custom Branding", category: "Enterprise", description: "Custom domain, whitelabel logo, & branded PDF certificates.", icon: "🌐" },
  { key: "staff_rbac_matrix", name: "Multi-Tenant Staff RBAC Matrix", category: "Enterprise", description: "Granular staff roles, permissions, & support audit controls.", icon: "🔐" },
  { key: "bureau_export_cibil", name: "Bureau Export (CIBIL/Experian)", category: "Enterprise", description: "Quarterly credit bureau compliance & reporting export.", icon: "📊" },
  { key: "cache_studio_access", name: "Cache & Performance Studio", category: "Enterprise", description: "High-performance Redis cache management & DB optimization.", icon: "🧹" },
  { key: "dedicated_api_sla", name: "Dedicated API & SLA Guarantee", category: "Enterprise", description: "Dedicated server infrastructure, 99.9% uptime SLA.", icon: "🛡️" },
];

export const DEFAULT_ADMIN_PLANS: Plan[] = [
  {
    id: "p1",
    code: "free",
    name: "Free Plan",
    price_monthly: 0,
    price_yearly: 0,
    is_recommended: false,
    is_popular: false,
    is_active: true,
    is_archived: false,
    max_loans: 3,
    max_storage_bytes: 104857600,
    max_reports: 5,
    max_ai_requests: 5,
    max_blockchain_proofs: 2,
    max_team_members: 1,
    workspace_limit: 1,
    allow_api_access: false,
    has_priority_support: false,
    has_custom_branding: false,
    features_json: ["my_loans", "credit_cards", "budget", "payments_log"],
  },
  {
    id: "p2",
    code: "basic",
    name: "Basic Plan",
    price_monthly: 499,
    price_yearly: 4990,
    is_recommended: false,
    is_popular: false,
    is_active: true,
    is_archived: false,
    max_loans: 10,
    max_storage_bytes: 1073741824,
    max_reports: 50,
    max_ai_requests: 50,
    max_blockchain_proofs: 10,
    max_team_members: 3,
    workspace_limit: 3,
    allow_api_access: false,
    has_priority_support: false,
    has_custom_branding: false,
    features_json: ["my_loans", "credit_cards", "budget", "investments", "payoff_quest", "statement_parser", "payments_log", "activity_log", "reports_export"],
  },
  {
    id: "p3",
    code: "premium",
    name: "Premium Plan",
    price_monthly: 999,
    price_yearly: 9990,
    is_recommended: true,
    is_popular: true,
    is_active: true,
    is_archived: false,
    max_loans: -1,
    max_storage_bytes: 10737418240,
    max_reports: -1,
    max_ai_requests: -1,
    max_blockchain_proofs: -1,
    max_team_members: 10,
    workspace_limit: 10,
    allow_api_access: true,
    has_priority_support: true,
    has_custom_branding: true,
    features_json: ["my_loans", "credit_cards", "budget", "investments", "payoff_quest", "joint_workspace", "refinance_studio", "auto_saver", "statement_parser", "payments_log", "activity_log", "zk_proofs", "receipt_anchoring", "p2p_market", "ai_coach", "reports_export"],
  },
  {
    id: "p4",
    code: "business",
    name: "Business Plan",
    price_monthly: 2499,
    price_yearly: 24990,
    is_recommended: false,
    is_popular: false,
    is_active: true,
    is_archived: false,
    max_loans: -1,
    max_storage_bytes: 107374182400,
    max_reports: -1,
    max_ai_requests: -1,
    max_blockchain_proofs: -1,
    max_team_members: 50,
    workspace_limit: 50,
    allow_api_access: true,
    has_priority_support: true,
    has_custom_branding: true,
    features_json: ["my_loans", "credit_cards", "budget", "investments", "payoff_quest", "joint_workspace", "refinance_studio", "auto_saver", "statement_parser", "payments_log", "activity_log", "zk_proofs", "receipt_anchoring", "p2p_market", "ai_coach", "reports_export", "api_access"],
  },
  {
    id: "p5",
    code: "enterprise",
    name: "Enterprise Plan",
    price_monthly: 4999,
    price_yearly: 49990,
    is_recommended: false,
    is_popular: false,
    is_active: true,
    is_archived: false,
    max_loans: -1,
    max_storage_bytes: 1073741824000,
    max_reports: -1,
    max_ai_requests: -1,
    max_blockchain_proofs: -1,
    max_team_members: 500,
    workspace_limit: 100,
    allow_api_access: true,
    has_priority_support: true,
    has_custom_branding: true,
    features_json: ["my_loans", "credit_cards", "budget", "investments", "payoff_quest", "joint_workspace", "refinance_studio", "auto_saver", "statement_parser", "payments_log", "activity_log", "zk_proofs", "receipt_anchoring", "p2p_market", "ai_coach", "reports_export", "api_access", "whitelabel_custom_domain", "staff_rbac_matrix", "bureau_export_cibil", "cache_studio_access", "dedicated_api_sla"],
  },
];

const ADMIN_PLANS_KEY = "debtproof_custom_admin_plans";

export const subscriptionService = {
  /**
   * Fetch user subscription overview & active features
   */
  async getSubscriptionOverview(): Promise<SubscriptionOverviewResponse> {
    try {
      const response = await apiClient.get<SubscriptionOverviewResponse>("/tenants/billing/plans/");
      if (response.data && response.data.plans && response.data.plans.length > 0) {
        return response.data;
      }
      const customPlansRaw = typeof window !== "undefined" ? localStorage.getItem(ADMIN_PLANS_KEY) : null;
      const plansToUse = customPlansRaw ? JSON.parse(customPlansRaw) : DEFAULT_ADMIN_PLANS;
      return {
        success: true,
        plans: plansToUse,
        current_subscription: null,
        allowed_features: ["my_loans", "credit_cards", "budget", "payments_log"],
        usage_stats: { loans_count: 0, ai_requests_count: 0, blockchain_proofs_count: 0, storage_bytes_used: 0 },
      };
    } catch (error) {
      console.warn("Failed to fetch subscription status, fallback to local custom plans", error);
      const customPlansRaw = typeof window !== "undefined" ? localStorage.getItem(ADMIN_PLANS_KEY) : null;
      const plansToUse = customPlansRaw ? JSON.parse(customPlansRaw) : DEFAULT_ADMIN_PLANS;
      return {
        success: true,
        plans: plansToUse,
        current_subscription: null,
        allowed_features: ["my_loans", "credit_cards", "budget", "payments_log"],
        usage_stats: { loans_count: 0, ai_requests_count: 0, blockchain_proofs_count: 0, storage_bytes_used: 0 },
      };
    }
  },

  /**
   * Subscribe / Upgrade user plan
   */
  async upgradePlan(planCode: string) {
    try {
      const response = await apiClient.post("/tenants/billing/subscribe/", { plan_code: planCode });
      return response.data;
    } catch {
      if (typeof window !== "undefined") {
        localStorage.setItem("debtproof_active_plan", planCode);
      }
      return { success: true, message: `Switched to ${planCode} tier.` };
    }
  },

  /**
   * Super Admin: Fetch features catalog
   */
  async getFeaturesCatalog(): Promise<PlanFeature[]> {
    try {
      const response = await apiClient.get<{ success: boolean; catalog: PlanFeature[] }>("/tenants/features-catalog/");
      if (response.data && response.data.catalog && response.data.catalog.length > 0) {
        return response.data.catalog;
      }
      return DEFAULT_CATALOG;
    } catch (error) {
      return DEFAULT_CATALOG;
    }
  },

  /**
   * Super Admin: List plans
   */
  async getAdminPlans(): Promise<Plan[]> {
    try {
      const response = await apiClient.get<{ success: boolean; plans: Plan[] }>("/tenants/admin/plans/");
      if (response.data && response.data.plans && response.data.plans.length > 0) {
        return response.data.plans;
      }
      const customPlansRaw = typeof window !== "undefined" ? localStorage.getItem(ADMIN_PLANS_KEY) : null;
      return customPlansRaw ? JSON.parse(customPlansRaw) : DEFAULT_ADMIN_PLANS;
    } catch {
      const customPlansRaw = typeof window !== "undefined" ? localStorage.getItem(ADMIN_PLANS_KEY) : null;
      return customPlansRaw ? JSON.parse(customPlansRaw) : DEFAULT_ADMIN_PLANS;
    }
  },

  /**
   * Super Admin: Save / Update Plan (limits, pricing, features_json)
   */
  async savePlan(planData: Partial<Plan>) {
    try {
      if (planData.id) {
        await apiClient.patch(`/tenants/admin/plans/${planData.id}/`, planData);
      } else {
        await apiClient.post("/tenants/admin/plans/", planData);
      }
    } catch (e) {
      console.warn("Saving plan to local storage fallback", e);
    }

    if (typeof window !== "undefined") {
      const currentPlans = await this.getAdminPlans();
      const planId = planData.id || `p_${Date.now()}`;
      const existingIdx = currentPlans.findIndex((p) => p.id === planData.id || p.code === planData.code);
      if (existingIdx !== -1) {
        currentPlans[existingIdx] = { ...currentPlans[existingIdx], ...planData } as Plan;
      } else {
        currentPlans.push({
          id: planId,
          code: planData.code || "custom",
          name: planData.name || "Custom Plan",
          price_monthly: planData.price_monthly ?? 499,
          price_yearly: planData.price_yearly ?? 4990,
          is_recommended: false,
          is_popular: false,
          is_active: true,
          is_archived: false,
          max_loans: planData.max_loans ?? 10,
          max_storage_bytes: 1073741824,
          max_reports: 50,
          max_ai_requests: planData.max_ai_requests ?? 50,
          max_blockchain_proofs: planData.max_blockchain_proofs ?? 10,
          max_team_members: 5,
          workspace_limit: 3,
          allow_api_access: false,
          has_priority_support: false,
          has_custom_branding: false,
          features_json: planData.features_json || ["my_loans", "credit_cards", "budget"],
        });
      }
      localStorage.setItem(ADMIN_PLANS_KEY, JSON.stringify(currentPlans));
    }
    return { success: true };
  },

  /**
   * Super Admin: Delete / Archive Plan
   */
  async deletePlan(planId: string) {
    try {
      await apiClient.delete(`/tenants/admin/plans/${planId}/`);
    } catch {}

    if (typeof window !== "undefined") {
      const currentPlans = await this.getAdminPlans();
      const filtered = currentPlans.filter((p) => p.id !== planId && p.code !== planId);
      localStorage.setItem(ADMIN_PLANS_KEY, JSON.stringify(filtered));
    }
    return { success: true };
  },
};
