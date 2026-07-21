"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/utils/formatters";
import type { DashboardData } from "@/types";

interface EmergencyBufferWidgetProps {
  data: DashboardData;
}

export function EmergencyBufferWidget({ data }: EmergencyBufferWidgetProps) {
  const [reserveFund, setReserveFund] = useState("150000");

  const monthlyTotalEmi = data.upcoming_emi_amount || 45000;
  const currentSavings = parseFloat(reserveFund) || 0;
  const runwayMonths = monthlyTotalEmi > 0 ? (currentSavings / monthlyTotalEmi) : 0;

  const getRunwayHealth = () => {
    if (runwayMonths >= 6) return { label: "Fully Protected (6+ Months Buffer) 🟢", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };
    if (runwayMonths >= 3) return { label: "Safe Runway (3 to 6 Months Buffer) 🟡", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" };
    return { label: "Low Emergency Cushion (< 3 Months) 🔴", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" };
  };

  const health = getRunwayHealth();

  return (
    <div className="card p-5 border border-[var(--color-border-light)] space-y-4 bg-[var(--color-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Emergency EMI Buffer Reserve Tracker</h3>
            <p className="text-[11px] text-[var(--color-text-tertiary)]">Job security & emergency payment protection runway</p>
          </div>
        </div>
        <span className={`text-xs font-bold ${health.color}`}>{health.label}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">Monthly Total Debt Commitments (₹)</label>
          <div className="p-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] font-bold text-[var(--color-error)] text-sm">
            {formatCurrency(monthlyTotalEmi)} / mo
          </div>
        </div>

        <div>
          <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">Emergency Fund / Liquid Savings (₹)</label>
          <input
            type="number"
            className="input w-full text-xs h-10 font-bold text-[var(--color-accent)]"
            value={reserveFund}
            onChange={(e) => setReserveFund(e.target.value)}
            placeholder="150000"
          />
        </div>

        <div>
          <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">Debt Runway Coverage</label>
          <div className={`p-2.5 rounded-xl border font-black text-sm flex items-center justify-between ${health.bg}`}>
            <span>{runwayMonths.toFixed(1)} Months</span>
            <span className="text-[10px] uppercase font-bold opacity-80">Covered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
