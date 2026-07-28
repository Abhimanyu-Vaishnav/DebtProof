"use client";

export type PlanTag = "Free" | "Basic" | "Pro" | "Premium" | "Enterprise";

export interface PlanDefinition {
  id: string;
  name: string;
  tag: PlanTag;
  price_monthly: number;
  price_yearly: number;
  max_loans: number;
  features: string[];
  popular?: boolean;
}

export const PLAN_MATRIX: Record<PlanTag, { maxLoans: number; hasBlockchain: boolean; hasAiAssistant: boolean; hasSimulator: boolean; hasClearancePdf: boolean; hasCibilTracking: boolean; hasWhitelabel: boolean }> = {
  Free: { maxLoans: 2, hasBlockchain: false, hasAiAssistant: false, hasSimulator: false, hasClearancePdf: false, hasCibilTracking: false, hasWhitelabel: false },
  Basic: { maxLoans: 5, hasBlockchain: true, hasAiAssistant: false, hasSimulator: false, hasClearancePdf: false, hasCibilTracking: false, hasWhitelabel: false },
  Pro: { maxLoans: 15, hasBlockchain: true, hasAiAssistant: true, hasSimulator: true, hasClearancePdf: true, hasCibilTracking: false, hasWhitelabel: false },
  Premium: { maxLoans: 999, hasBlockchain: true, hasAiAssistant: true, hasSimulator: true, hasClearancePdf: true, hasCibilTracking: true, hasWhitelabel: false },
  Enterprise: { maxLoans: 9999, hasBlockchain: true, hasAiAssistant: true, hasSimulator: true, hasClearancePdf: true, hasCibilTracking: true, hasWhitelabel: true },
};

export function getUserPlan(): PlanTag {
  if (typeof window === "undefined") return "Pro";
  const userRaw = localStorage.getItem("debtproof_user");
  if (userRaw) {
    try {
      const u = JSON.parse(userRaw);
      if (u.plan) return u.plan as PlanTag;
      if (u.is_superuser) return "Enterprise";
      if (u.is_staff) return "Pro";
    } catch {}
  }
  return (localStorage.getItem("debtproof_active_plan") as PlanTag) || "Pro";
}

export function checkPlanPermission(permission: keyof typeof PLAN_MATRIX.Pro, currentLoanCount = 0): { allowed: boolean; reason?: string } {
  const planTag = getUserPlan();
  const rules = PLAN_MATRIX[planTag] || PLAN_MATRIX.Free;

  if (permission === "maxLoans") {
    const allowed = currentLoanCount < rules.maxLoans;
    return {
      allowed,
      reason: allowed ? undefined : `Your current ${planTag} Plan limits you to ${rules.maxLoans} active loans. Upgrade your plan to add more loans.`,
    };
  }

  const allowed = Boolean(rules[permission]);
  return {
    allowed,
    reason: allowed ? undefined : `Feature requires Pro or higher plan. Your current plan is ${planTag}.`,
  };
}
