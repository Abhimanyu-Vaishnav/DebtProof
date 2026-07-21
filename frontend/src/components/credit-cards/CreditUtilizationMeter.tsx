"use client";

import React from "react";
import { formatCurrency } from "@/utils/formatters";

interface CreditUtilizationMeterProps {
  totalLimit?: number;
  totalBalance?: number;
}

export function CreditUtilizationMeter({ totalLimit = 500000, totalBalance = 125000 }: CreditUtilizationMeterProps) {
  const ratio = totalLimit > 0 ? Math.min(100, Math.max(0, (totalBalance / totalLimit) * 100)) : 0;

  const getHealthStatus = () => {
    if (ratio < 30) return { label: "Optimal Credit Health 🟢", color: "text-emerald-700 dark:text-emerald-400", barColor: "bg-emerald-500" };
    if (ratio < 70) return { label: "Moderate Utilization 🟡", color: "text-amber-700 dark:text-amber-400", barColor: "bg-amber-500" };
    return { label: "High Risk Utilization 🔴", color: "text-rose-700 dark:text-rose-400", barColor: "bg-rose-500" };
  };

  const status = getHealthStatus();

  return (
    <div className="card p-5 border border-[var(--color-border)] space-y-4 bg-[var(--color-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">💳</span>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Credit Card Utilization Meter</h3>
            <p className="text-[11px] text-[var(--color-text-secondary)] font-medium">Recommended limit utilization &lt; 30%</p>
          </div>
        </div>
        <span className={`text-xs font-black ${status.color}`}>{status.label}</span>
      </div>

      {/* Progress Bar & Ratio */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-extrabold text-[var(--color-text-primary)]">
          <span>Current Ratio: {ratio.toFixed(1)}%</span>
          <span>Target &lt; 30%</span>
        </div>
        <div className="w-full bg-[var(--color-surface-tertiary)] h-3 rounded-full overflow-hidden p-0.5 border border-[var(--color-border)]">
          <div
            className={`h-full rounded-full transition-all duration-700 ${status.barColor}`}
            style={{ width: `${ratio}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-semibold text-[var(--color-text-secondary)]">
          <span>Used: {formatCurrency(totalBalance)}</span>
          <span>Total Limit: {formatCurrency(totalLimit)}</span>
        </div>
      </div>
    </div>
  );
}
