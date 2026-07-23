/**
 * DebtProof — Centralized Feature Flags Studio Page
 */
"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { tenantsService } from "@/services/tenants.service";
import { FeatureFlag } from "@/types/saas";

export default function FeatureFlagsPage() {
  const { activeOrganization, refreshTenants } = useTenant();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [msg, setMsg] = useState("");

  const loadFlags = async () => {
    const list = await tenantsService.getFeatureFlags();
    setFlags(list);
  };

  useEffect(() => {
    loadFlags();
  }, [activeOrganization]);

  const handleToggle = async (key: string, currentStatus: boolean) => {
    try {
      await tenantsService.toggleFeatureFlag(key, !currentStatus);
      setMsg(`Updated '${key}' feature state.`);
      await loadFlags();
      refreshTenants();
    } catch {
      setMsg("Failed to toggle feature flag.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Centralized Feature Flags Studio</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Enable or disable core application modules dynamically per Organization.</p>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          {msg}
        </div>
      )}

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="divide-y divide-[var(--color-border-light)]">
          {flags.map((flag) => (
            <div key={flag.id} className="py-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[var(--color-text-primary)]">{flag.name}</h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-500/10 text-slate-400">
                    {flag.key}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-tertiary)]">{flag.description}</p>
              </div>

              <button
                onClick={() => handleToggle(flag.key, flag.is_enabled)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  flag.is_enabled ? "bg-emerald-500" : "bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    flag.is_enabled ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
