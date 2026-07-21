"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/utils/formatters";
import type { DashboardData } from "@/types";

interface EMIBounceProtectionWidgetProps {
  data: DashboardData;
}

export function EMIBounceProtectionWidget({ data }: EMIBounceProtectionWidgetProps) {
  const [bankBalance, setBankBalance] = useState("35000");

  const upcoming7DaysEmi = data.upcoming_emi_amount || 22000;
  const currentBankBalance = parseFloat(bankBalance) || 0;
  const netShortfall = Math.max(0, upcoming7DaysEmi - currentBankBalance);

  const getBounceRisk = () => {
    if (netShortfall > 0) {
      return {
        label: `HIGH BOUNCE RISK (Shortfall ${formatCurrency(netShortfall)}) 🔴`,
        color: "text-rose-400",
        bg: "bg-rose-500/10 border-rose-500/30",
        badge: "Potential ₹500 Bank Penalty Penalty",
      };
    }
    return {
      label: "BANK BALANCE SUFFICIENT (Auto-Debits Safe) 🟢",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/30",
      badge: "Zero Bounce Risk",
    };
  };

  const risk = getBounceRisk();

  return (
    <div className="card p-5 border border-[var(--color-border-light)] space-y-4 bg-[var(--color-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏦</span>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">EMI Auto-Debits Bank Balance Health Checker</h3>
            <p className="text-[11px] text-[var(--color-text-tertiary)]">Prevent ₹500+ EMI bounce charges & NACH auto-debit failure penalties</p>
          </div>
        </div>
        <span className={`text-xs font-bold ${risk.color}`}>{risk.label}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">7-Day Upcoming EMI Debits (₹)</label>
          <div className="p-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] font-bold text-[var(--color-primary)] text-sm">
            {formatCurrency(upcoming7DaysEmi)}
          </div>
        </div>

        <div>
          <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">Primary Bank Account Balance (₹)</label>
          <input
            type="number"
            className="input w-full text-xs h-10 font-bold text-[var(--color-accent)]"
            value={bankBalance}
            onChange={(e) => setBankBalance(e.target.value)}
            placeholder="35000"
          />
        </div>

        <div>
          <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">NACH Auto-Debit Status</label>
          <div className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-between ${risk.bg}`}>
            <span>{risk.badge}</span>
            <span className={`font-black ${netShortfall > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {netShortfall > 0 ? `-${formatCurrency(netShortfall)}` : "Protected"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
