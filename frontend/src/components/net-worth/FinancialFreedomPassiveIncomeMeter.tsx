"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/utils/formatters";

export function FinancialFreedomPassiveIncomeMeter() {
  const [passiveIncome, setPassiveIncome] = useState<number>(45000);
  const [monthlyLiabilities, setMonthlyLiabilities] = useState<number>(32500);

  const freedomRatioPct = monthlyLiabilities > 0
    ? Math.round((passiveIncome / monthlyLiabilities) * 100)
    : 100;

  const isFinanciallyFree = freedomRatioPct >= 100;

  return (
    <div className="card p-6 border-2 border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 via-[var(--color-surface)] to-[var(--color-surface)] space-y-5 rounded-2xl shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--color-border-light)] pb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="text-base font-black text-[var(--color-text-primary)]">
              Financial Freedom Index & Passive Income vs Liability Meter
            </h3>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Measures your monthly passive asset yield against total monthly EMI liabilities.
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${
          isFinanciallyFree ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-purple-500/20 text-purple-400 border-purple-500/30"
        }`}>
          {isFinanciallyFree ? "🎉 Financially Free (Yield &gt; Liabilities)" : "⚡ Payoff Sprint Active"}
        </span>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-2">
          <label className="font-bold text-[var(--color-text-secondary)] uppercase text-[10px]">Monthly Passive Income / Staking Yield (₹)</label>
          <input
            type="number"
            value={passiveIncome}
            onChange={(e) => setPassiveIncome(Number(e.target.value))}
            className="form-input text-xs w-full font-bold font-mono"
            step={2000}
          />
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-2">
          <label className="font-bold text-[var(--color-text-secondary)] uppercase text-[10px]">Total Monthly Debt Liabilities / EMI (₹)</label>
          <input
            type="number"
            value={monthlyLiabilities}
            onChange={(e) => setMonthlyLiabilities(Number(e.target.value))}
            className="form-input text-xs w-full font-bold font-mono"
            step={2000}
          />
        </div>
      </div>

      {/* Progress Bar Gauge */}
      <div className="space-y-2">
        <div className="flex justify-between items-center font-mono text-xs font-bold">
          <span className="text-[var(--color-text-secondary)]">Freedom Coverage Ratio: <strong className="text-indigo-400">{freedomRatioPct}%</strong></span>
          <span className="text-emerald-400">Target: 100% (Passive Yield Covers All EMI)</span>
        </div>

        <div className="w-full h-3 rounded-full bg-[var(--color-surface-tertiary)] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all"
            style={{ width: `${Math.min(100, freedomRatioPct)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default FinancialFreedomPassiveIncomeMeter;
