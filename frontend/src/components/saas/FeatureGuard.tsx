/**
 * DebtProof — Feature Access Guard Component
 */
"use client";

import React, { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { UpgradeModal } from "@/components/saas/UpgradeModal";

interface FeatureGuardProps {
  children: React.ReactNode;
  featureKey: string;
  featureName: string;
  requiredPlan?: "basic" | "premium" | "business" | "enterprise";
}

export function FeatureGuard({
  children,
  featureKey,
  featureName,
  requiredPlan = "premium",
}: FeatureGuardProps) {
  const { activeOrganization, isFeatureEnabled } = useTenant();
  const [modalOpen, setModalOpen] = useState(false);

  // 1. Check feature flag toggle
  if (!isFeatureEnabled(featureKey)) {
    return (
      <div className="p-8 text-center border border-dashed border-[var(--color-border)] rounded-2xl space-y-2">
        <span className="text-2xl">🚫</span>
        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{featureName} Feature Disabled</h3>
        <p className="text-xs text-[var(--color-text-tertiary)]">This module has been toggled off by your Organization Administrator.</p>
      </div>
    );
  }

  // 2. Check subscription tier
  const planCode = activeOrganization?.slug ? "premium" : "free"; // Evaluate subscription plan code
  const isFreePlan = planCode === "free";

  // Lock premium features on free plan
  const isLocked = isFreePlan && (featureKey === "budget" || featureKey === "analytics" || featureKey === "investments" || featureKey === "ai" || featureKey === "p2p_market");

  if (isLocked) {
    return (
      <div className="relative">
        <div className="filter blur-sm pointer-events-none opacity-40 select-none">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="p-6 rounded-3xl bg-[var(--color-surface)]/90 border border-amber-500/30 backdrop-blur-xl space-y-3 max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-xl mx-auto border border-amber-500/30">
              🔒
            </div>
            <h3 className="text-base font-black text-[var(--color-text-primary)]">{featureName} Locked</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">Upgrade to {requiredPlan.toUpperCase()} tier to unlock this module.</p>
            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-xs font-bold transition shadow-md cursor-pointer"
            >
              Unlock {featureName}
            </button>
          </div>
        </div>

        <UpgradeModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          featureName={featureName}
          requiredPlan={requiredPlan.toUpperCase()}
        />
      </div>
    );
  }

  return <>{children}</>;
}
