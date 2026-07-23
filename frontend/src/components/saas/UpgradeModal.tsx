/**
 * DebtProof — SaaS Feature Lock Upgrade Modal
 */
"use client";

import React from "react";
import Link from "next/link";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  requiredPlan?: string;
}

export function UpgradeModal({ isOpen, onClose, featureName, requiredPlan = "Premium" }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 w-full max-w-lg space-y-6 shadow-2xl relative text-center">
        {/* Top Lock Badge */}
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center text-3xl mx-auto shadow-inner">
          🔒
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            {requiredPlan} Feature Lock
          </span>
          <h2 className="text-2xl font-black text-[var(--color-text-primary)]">
            Upgrade to Access {featureName}
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
            This module is exclusive to <strong className="text-[var(--color-text-primary)]">{requiredPlan}</strong> tier subscribers. Upgrade your organization plan to unlock unlimited access.
          </p>
        </div>

        {/* Benefits List */}
        <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] rounded-2xl p-4 text-left space-y-2">
          <p className="text-[11px] font-black uppercase text-[var(--color-text-tertiary)]">What you unlock with {requiredPlan}:</p>
          <ul className="text-xs font-semibold text-[var(--color-text-primary)] space-y-1.5">
            <li className="flex items-center gap-2">✅ Full {featureName} Access</li>
            <li className="flex items-center gap-2">✅ Multi-Workspace & Team Members</li>
            <li className="flex items-center gap-2">✅ Advanced Analytics & Export Engine</li>
            <li className="flex items-center gap-2">✅ Monad Blockchain SHA-256 Anchoring</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-1/2 py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] transition cursor-pointer"
          >
            Maybe Later
          </button>
          <Link
            href="/dashboard/organization/billing"
            onClick={onClose}
            className="w-full sm:w-1/2 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-xs font-black text-center transition shadow-lg cursor-pointer flex items-center justify-center gap-1"
          >
            <span>Upgrade Plan</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
