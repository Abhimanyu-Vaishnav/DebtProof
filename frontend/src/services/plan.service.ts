"use client";

export type PlanTag = "Free" | "Basic" | "Pro" | "Premium" | "Enterprise";

export interface PlanFeatureDetail {
  key: string;
  name: string;
  free: string | boolean;
  basic: string | boolean;
  pro: string | boolean;
  premium: string | boolean;
  enterprise: string | boolean;
}

export const ALL_APP_FEATURES: PlanFeatureDetail[] = [
  { key: "maxLoans", name: "Active Loan Limit", free: "3 Loans", basic: "10 Loans", pro: "Unlimited", premium: "Unlimited", enterprise: "Unlimited" },
  { key: "hasCalendar", name: "EMI Payment Calendar & Alerts", free: true, basic: true, pro: true, premium: true, enterprise: true },
  { key: "hasBlockchain", name: "Monad Blockchain SHA-256 Proofs", free: false, basic: true, pro: true, premium: true, enterprise: true },
  { key: "hasAiAssistant", name: "AI Debt Destroyer Assistant", free: false, basic: false, pro: true, premium: true, enterprise: true },
  { key: "hasSimulator", name: "Snowball vs Avalanche Payoff Simulator", free: false, basic: false, pro: true, premium: true, enterprise: true },
  { key: "hasClearancePdf", name: "Zero-Debt PDF Discharge Certificates", free: false, basic: false, pro: true, premium: true, enterprise: true },
  { key: "hasP2pSettlement", name: "P2P Debt Settlement & Waiver Desk", free: false, basic: false, pro: true, premium: true, enterprise: true },
  { key: "hasCibilTracking", name: "CIBIL Score & 30-Day Default Risk Heatmap", free: false, basic: false, pro: false, premium: true, enterprise: true },
  { key: "hasMonadEscrow", name: "Web3 Monad Escrow Vault Inspection", free: false, basic: false, pro: false, premium: true, enterprise: true },
  { key: "hasWhitelabel", name: "Whitelabel Domain, Staff RBAC & Bureau Export", free: false, basic: false, pro: false, premium: false, enterprise: true },
];

export const PLAN_MATRIX: Record<PlanTag, {
  maxLoans: number;
  hasCalendar: boolean;
  hasBlockchain: boolean;
  hasAiAssistant: boolean;
  hasSimulator: boolean;
  hasClearancePdf: boolean;
  hasP2pSettlement: boolean;
  hasCibilTracking: boolean;
  hasMonadEscrow: boolean;
  hasWhitelabel: boolean;
}> = {
  Free: { maxLoans: 3, hasCalendar: true, hasBlockchain: false, hasAiAssistant: false, hasSimulator: false, hasClearancePdf: false, hasP2pSettlement: false, hasCibilTracking: false, hasMonadEscrow: false, hasWhitelabel: false },
  Basic: { maxLoans: 10, hasCalendar: true, hasBlockchain: true, hasAiAssistant: false, hasSimulator: false, hasClearancePdf: false, hasP2pSettlement: false, hasCibilTracking: false, hasMonadEscrow: false, hasWhitelabel: false },
  Pro: { maxLoans: 999, hasCalendar: true, hasBlockchain: true, hasAiAssistant: true, hasSimulator: true, hasClearancePdf: true, hasP2pSettlement: true, hasCibilTracking: false, hasMonadEscrow: false, hasWhitelabel: false },
  Premium: { maxLoans: 999, hasCalendar: true, hasBlockchain: true, hasAiAssistant: true, hasSimulator: true, hasClearancePdf: true, hasP2pSettlement: true, hasCibilTracking: true, hasMonadEscrow: true, hasWhitelabel: false },
  Enterprise: { maxLoans: 9999, hasCalendar: true, hasBlockchain: true, hasAiAssistant: true, hasSimulator: true, hasClearancePdf: true, hasP2pSettlement: true, hasCibilTracking: true, hasMonadEscrow: true, hasWhitelabel: true },
};

export function getUserPlan(): PlanTag {
  if (typeof window === "undefined") return "Free";

  const candidates = [
    localStorage.getItem("debtproof_active_plan"),
    localStorage.getItem("debtproof_plan"),
    localStorage.getItem("active_plan"),
    localStorage.getItem("plan"),
  ];

  for (const raw of candidates) {
    if (raw) {
      const formatted = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
      if (PLAN_MATRIX[formatted as PlanTag]) return formatted as PlanTag;
    }
  }

  try {
    const userRaw = localStorage.getItem("debtproof_user") || localStorage.getItem("user");
    if (userRaw) {
      const parsed = JSON.parse(userRaw);
      const val = parsed?.plan || parsed?.active_plan;
      if (val) {
        const formatted = String(val).charAt(0).toUpperCase() + String(val).slice(1).toLowerCase();
        if (PLAN_MATRIX[formatted as PlanTag]) return formatted as PlanTag;
      }
    }
  } catch {}

  return "Free";
}

export function setUserPlan(plan: PlanTag): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("debtproof_active_plan", plan.toLowerCase());
  localStorage.setItem("debtproof_plan", plan.toLowerCase());
  window.dispatchEvent(new CustomEvent("debtproof_plan_changed", { detail: plan }));
}

export function checkPlanPermission(permission: keyof typeof PLAN_MATRIX.Pro, currentLoanCount = 0): { allowed: boolean; reason?: string } {
  const planTag = getUserPlan();
  const rules = PLAN_MATRIX[planTag] || PLAN_MATRIX.Free;

  if (permission === "maxLoans") {
    const allowed = currentLoanCount < rules.maxLoans;
    return {
      allowed,
      reason: allowed ? undefined : `Limit Reached! Your current ${planTag} Plan limit is ${rules.maxLoans} active loans. You currently have ${currentLoanCount} loans. Please upgrade your plan to add more.`,
    };
  }

  const allowed = Boolean(rules[permission]);
  return {
    allowed,
    reason: allowed ? undefined : `This feature requires a higher plan (Basic or Premium). Your active plan is ${planTag}.`,
  };
}
