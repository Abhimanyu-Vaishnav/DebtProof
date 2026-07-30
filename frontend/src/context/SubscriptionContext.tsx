"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { subscriptionService, Plan, SubscriptionStatus } from "@/services/subscription.service";

interface PaywallInfo {
  featureKey?: string;
  featureName?: string;
  reason?: string;
  requiredTier?: string;
}

interface SubscriptionContextType {
  plans: Plan[];
  currentSubscription: SubscriptionStatus | null;
  currentPlan: Plan | null;
  allowedFeatures: string[];
  usageStats: {
    loans_count: number;
    ai_requests_count: number;
    blockchain_proofs_count: number;
    storage_bytes_used: number;
  };
  isLoading: boolean;
  isPaywallOpen: boolean;
  paywallInfo: PaywallInfo | null;
  hasAccess: (featureKey: string) => boolean;
  canCreateLoan: () => { allowed: boolean; reason?: string };
  openPaywall: (info?: PaywallInfo) => void;
  closePaywall: () => void;
  upgradePlan: (planCode: string) => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionStatus | null>(null);
  const [allowedFeatures, setAllowedFeatures] = useState<string[]>(["my_loans", "credit_cards", "budget", "payments_log"]);
  const [usageStats, setUsageStats] = useState({
    loans_count: 0,
    ai_requests_count: 0,
    blockchain_proofs_count: 0,
    storage_bytes_used: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [paywallInfo, setPaywallInfo] = useState<PaywallInfo | null>(null);

  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await subscriptionService.getSubscriptionOverview();
      if (res.plans) setPlans(res.plans);
      if (res.current_subscription) setCurrentSubscription(res.current_subscription);
      if (res.allowed_features) setAllowedFeatures(res.allowed_features);
      if (res.usage_stats) setUsageStats(res.usage_stats);
    } catch (e) {
      console.error("Failed to load subscription overview", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const activeCodeFromStorage = typeof window !== "undefined" ? localStorage.getItem("debtproof_active_plan") : null;

  const currentPlan =
    currentSubscription?.plan ||
    plans.find((p) => p.code.toLowerCase() === (activeCodeFromStorage || "free").toLowerCase()) ||
    plans.find((p) => p.code === "free") ||
    {
      id: "free",
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
    };

  const hasAccess = useCallback(
    (featureKey: string): boolean => {
      if (!featureKey) return true;
      if (currentPlan?.code === "business" || currentPlan?.code === "enterprise") return true;
      return allowedFeatures.includes(featureKey);
    },
    [allowedFeatures, currentPlan]
  );

  const getActualLoanCount = useCallback(() => {
    if (usageStats?.loans_count) return usageStats.loans_count;
    if (typeof window !== "undefined") {
      try {
        const localLoans = localStorage.getItem("debtproof_local_loans");
        if (localLoans) {
          const parsed = JSON.parse(localLoans);
          if (Array.isArray(parsed)) return parsed.length;
        }
      } catch {}
    }
    return 0;
  }, [usageStats]);

  const canCreateLoan = useCallback(() => {
    if (!currentPlan) return { allowed: true };
    if (currentPlan.max_loans === -1) return { allowed: true };
    const count = getActualLoanCount();
    if (count >= currentPlan.max_loans) {
      return {
        allowed: false,
        reason: `Loan Quota Exceeded! Your current ${currentPlan.name} allows a maximum of ${currentPlan.max_loans} active loans. You currently have ${count} active loans. Please upgrade your subscription tier to manage more loans.`,
      };
    }
    return { allowed: true };
  }, [currentPlan, getActualLoanCount]);

  const openPaywall = useCallback((info?: PaywallInfo) => {
    setPaywallInfo(info || { reason: "Unlock full financial command features by upgrading your membership tier." });
    setIsPaywallOpen(true);
  }, []);

  const closePaywall = useCallback(() => {
    setIsPaywallOpen(false);
    setPaywallInfo(null);
  }, []);

  const upgradePlan = async (planCode: string): Promise<boolean> => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("debtproof_active_plan", planCode);
      }
      await subscriptionService.upgradePlan(planCode);
      await fetchOverview();
      setIsPaywallOpen(false);
      return true;
    } catch (e) {
      console.warn("API Upgrade fallback to client state", e);
      if (typeof window !== "undefined") {
        localStorage.setItem("debtproof_active_plan", planCode);
      }
      await fetchOverview();
      setIsPaywallOpen(false);
      return true;
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        plans,
        currentSubscription,
        currentPlan,
        allowedFeatures,
        usageStats,
        isLoading,
        isPaywallOpen,
        paywallInfo,
        hasAccess,
        canCreateLoan,
        openPaywall,
        closePaywall,
        upgradePlan,
        refreshSubscription: fetchOverview,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
