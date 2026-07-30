"use client";

import React from "react";
import { useSubscription } from "@/context/SubscriptionContext";
import { Lock, Sparkles, Zap, ShieldCheck } from "lucide-react";

interface FeatureGateProps {
  featureKey: string;
  featureName: string;
  description?: string;
  children: React.ReactNode;
  fallbackMode?: "lock-card" | "blur" | "hide";
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  featureKey,
  featureName,
  description = "This feature requires an upgraded membership plan to access.",
  children,
  fallbackMode = "lock-card",
}) => {
  const { hasAccess, openPaywall, currentPlan } = useSubscription();

  if (hasAccess(featureKey)) {
    return <>{children}</>;
  }

  if (fallbackMode === "hide") {
    return null;
  }

  if (fallbackMode === "blur") {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border-light,#e2e8f0)]">
        <div className="filter blur-md pointer-events-none opacity-30 select-none p-4">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md text-center">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-full mb-3 shadow-lg">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Locked in {currentPlan?.name || "Free Plan"}</h3>
          <p className="text-sm text-slate-300 max-w-md mb-4">{description}</p>
          <button
            onClick={() => openPaywall({ featureKey, featureName, reason: description })}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-extrabold text-sm rounded-xl shadow-xl transition flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> Upgrade Plan to Unlock Access
          </button>
        </div>
      </div>
    );
  }

  // Default: lock-card
  return (
    <div className="my-6 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/90 to-purple-950/90 text-white border-2 border-indigo-500/40 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4 text-left">
          <div className="p-3.5 bg-gradient-to-br from-amber-500 to-indigo-600 text-white rounded-2xl shadow-xl shrink-0">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2 border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Locked in {currentPlan?.name || "Free Tier"} • {featureName}
            </div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">{featureName}</h3>
            <p className="mt-1 text-sm text-slate-300 max-w-xl font-medium leading-relaxed">{description}</p>
          </div>
        </div>

        <button
          onClick={() => openPaywall({ featureKey, featureName, reason: description })}
          className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-extrabold text-sm rounded-2xl shadow-xl hover:shadow-indigo-500/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <Zap className="w-4 h-4 text-amber-300" /> Upgrade Plan to Unlock Access
        </button>
      </div>
    </div>
  );
};
