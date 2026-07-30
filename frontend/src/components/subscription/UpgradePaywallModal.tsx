"use client";

import React, { useState } from "react";
import { useSubscription } from "@/context/SubscriptionContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Plan } from "@/services/subscription.service";
import { Lock, Sparkles, Check, ShieldCheck, Zap, X, ArrowRight, CheckCircle2 } from "lucide-react";

const DEFAULT_PLANS: Plan[] = [
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
    features_json: ["my_loans", "credit_cards", "budget", "investments", "payoff_quest", "statement_parser", "payments_log", "reports_export"],
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

export const UpgradePaywallModal: React.FC = () => {
  const { isPaywallOpen, closePaywall, paywallInfo, plans, currentPlan, upgradePlan } = useSubscription();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const [upgradingCode, setUpgradingCode] = useState<string | null>(null);

  if (!isPaywallOpen) return null;

  const displayPlans = plans && plans.length > 0 ? plans : DEFAULT_PLANS;
  const activeCode = (currentPlan?.code || "free").toLowerCase();

  const handleUpgrade = async (code: string) => {
    setUpgradingCode(code);
    await upgradePlan(code);
    setUpgradingCode(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 md:p-8 transition-all shadow-2xl border ${
          isLight
            ? "bg-white text-slate-900 border-slate-200"
            : "bg-slate-900 text-white border-slate-800"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={closePaywall}
          className={`absolute top-5 right-5 p-2 rounded-full transition cursor-pointer ${
            isLight
              ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest mb-3 border ${
              isLight
                ? "bg-amber-500/10 border-amber-500/25 text-amber-700"
                : "bg-amber-500/15 border-amber-500/30 text-amber-400"
            }`}
          >
            <Lock className="w-4 h-4 text-amber-500" /> Plan Access Control
          </div>

          <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            {paywallInfo?.featureName ? (
              <>
                Unlock Full Access to{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 dark:from-purple-400 dark:via-indigo-400 dark:to-amber-400">
                  {paywallInfo.featureName}
                </span>
              </>
            ) : (
              <>
                Upgrade Your{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 dark:from-purple-400 dark:via-indigo-400 dark:to-amber-400">
                  DebtProof Tier
                </span>
              </>
            )}
          </h2>

          <p className={`mt-2 text-xs md:text-sm font-medium ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            {paywallInfo?.reason ||
              "Upgrade your subscription tier to access advanced AI payoff strategies, zero-knowledge proofs, refinance studio, micro-savers, and unlimited bank tracking."}
          </p>

          <div
            className={`mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold ${
              isLight
                ? "bg-indigo-50 border-indigo-200 text-indigo-900"
                : "bg-indigo-950/60 border-indigo-500/30 text-indigo-300"
            }`}
          >
            <span>Current Membership Tier:</span>
            <span className="font-extrabold text-white uppercase px-2.5 py-0.5 rounded-md bg-indigo-600">
              {currentPlan?.name || "Free Plan"}
            </span>
          </div>
        </div>

        {/* Plan Cards Grid (Responsive 1, 2, or 5 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          {displayPlans
            .filter((p) => !p.is_archived)
            .map((plan) => {
              const isCurrent = activeCode === plan.code.toLowerCase();
              const isPopular = plan.is_popular || plan.is_recommended;
              const isUpgrading = upgradingCode === plan.code;

              return (
                <div
                  key={plan.id || plan.code}
                  className={`relative flex flex-col rounded-2xl p-5 transition-all duration-200 ${
                    isCurrent
                      ? isLight
                        ? "bg-emerald-50/80 text-slate-900 border-2 border-emerald-500 shadow-md"
                        : "bg-slate-800/90 text-white border-2 border-emerald-500 shadow-lg shadow-emerald-500/10"
                      : isPopular
                      ? isLight
                        ? "bg-gradient-to-b from-indigo-50/90 via-purple-50/90 to-amber-50/50 text-slate-900 border-2 border-indigo-500 shadow-xl scale-[1.02]"
                        : "bg-gradient-to-b from-indigo-950/90 to-purple-950/90 text-white border-2 border-indigo-500 shadow-xl shadow-indigo-500/20 scale-[1.02]"
                      : isLight
                      ? "bg-slate-50 text-slate-900 border border-slate-200 hover:border-slate-300 shadow-sm"
                      : "bg-slate-950/90 text-white border border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Badges */}
                  {isCurrent && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active Plan
                    </div>
                  )}

                  {!isCurrent && isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Recommended
                    </div>
                  )}

                  <div className="mb-3 pt-1">
                    <h3 className={`text-lg font-extrabold ${isLight ? "text-slate-900" : "text-white"}`}>
                      {plan.name}
                    </h3>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className={`text-2xl font-black ${isLight ? "text-slate-900" : "text-white"}`}>
                        {Number(plan.price_monthly) === 0
                          ? "Free"
                          : `₹${Number(plan.price_monthly).toLocaleString("en-IN")}`}
                      </span>
                      {Number(plan.price_monthly) > 0 && (
                        <span className={`text-xs font-semibold ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                          /month
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quotas & Features List */}
                  <ul
                    className={`space-y-2.5 text-xs mb-5 flex-1 border-t pt-3.5 ${
                      isLight ? "border-slate-200 text-slate-800" : "border-slate-800 text-slate-200"
                    }`}
                  >
                    <li className="flex items-center gap-2">
                      <Check
                        className={`w-4 h-4 shrink-0 stroke-[2.5] ${
                          isCurrent
                            ? "text-emerald-500"
                            : isPopular
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-emerald-500"
                        }`}
                      />
                      <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                        {plan.max_loans === -1
                          ? "Unlimited Bank Loans"
                          : `Up to ${plan.max_loans} Bank Loans`}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check
                        className={`w-4 h-4 shrink-0 stroke-[2.5] ${
                          isCurrent
                            ? "text-emerald-500"
                            : isPopular
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-emerald-500"
                        }`}
                      />
                      <span className={`font-semibold ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                        {plan.max_ai_requests === -1
                          ? "Unlimited AI Requests"
                          : `${plan.max_ai_requests} AI Requests/mo`}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check
                        className={`w-4 h-4 shrink-0 stroke-[2.5] ${
                          isCurrent
                            ? "text-emerald-500"
                            : isPopular
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-emerald-500"
                        }`}
                      />
                      <span className={`font-semibold ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                        {plan.max_blockchain_proofs === -1
                          ? "Unlimited Monad Proofs"
                          : `${plan.max_blockchain_proofs} Monad Proofs/mo`}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check
                        className={`w-4 h-4 shrink-0 stroke-[2.5] ${
                          isCurrent
                            ? "text-emerald-500"
                            : isPopular
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-emerald-500"
                        }`}
                      />
                      <span className={`font-semibold ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                        {plan.features_json?.includes("refinance_studio")
                          ? "Refinance Savings Studio"
                          : "Basic EMI Calculator"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check
                        className={`w-4 h-4 shrink-0 stroke-[2.5] ${
                          isCurrent
                            ? "text-emerald-500"
                            : isPopular
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-emerald-500"
                        }`}
                      />
                      <span className={`font-semibold ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                        {plan.features_json?.includes("auto_saver")
                          ? "Micro Auto-Saver Vault"
                          : "Manual Payments Log"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check
                        className={`w-4 h-4 shrink-0 stroke-[2.5] ${
                          isCurrent
                            ? "text-emerald-500"
                            : isPopular
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-emerald-500"
                        }`}
                      />
                      <span className={`font-semibold ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                        {plan.features_json?.includes("zk_proofs")
                          ? "Zero-Knowledge Credit Proofs"
                          : "Basic PDF Proofs"}
                      </span>
                    </li>
                  </ul>

                  {/* Action Button */}
                  {isCurrent ? (
                    <button
                      disabled
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs cursor-default text-center flex items-center justify-center gap-1.5 ${
                        isLight
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.code)}
                      disabled={isUpgrading}
                      className={`w-full py-2.5 px-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-lg cursor-pointer ${
                        isPopular
                          ? "bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white"
                          : isLight
                          ? "bg-slate-900 hover:bg-slate-800 text-white font-bold"
                          : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold"
                      }`}
                    >
                      {isUpgrading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-amber-400" /> Upgrade to {plan.name}{" "}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
        </div>

        {/* Footer Guarantee */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t text-xs ${
            isLight ? "border-slate-200 text-slate-500" : "border-slate-800 text-slate-400"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Managed via Super Admin • Instant Plan Activation & Real-time Quotas</span>
          </div>
          <button
            onClick={closePaywall}
            className={`underline font-semibold cursor-pointer ${
              isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-white"
            }`}
          >
            Continue with current plan
          </button>
        </div>
      </div>
    </div>
  );
};
