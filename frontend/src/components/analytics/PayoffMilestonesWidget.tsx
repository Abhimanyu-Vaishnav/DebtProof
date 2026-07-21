"use client";

import React from "react";
import { formatCurrency } from "@/utils/formatters";
import type { DashboardData } from "@/types";

interface PayoffMilestonesWidgetProps {
  data: DashboardData;
}

export function PayoffMilestonesWidget({ data }: PayoffMilestonesWidgetProps) {
  const totalPrincipal = data.total_principal_active || 1;
  const totalPaid = data.total_paid_active || 0;
  const progressPct = Math.min(100, Math.max(0, (totalPaid / totalPrincipal) * 100));

  const milestones = [
    {
      pct: 25,
      title: "Quarter Payoff",
      subtitle: "25% Debt Eradicated",
      emoji: "🥉",
      color: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-700 dark:text-amber-400",
      activeBg: "bg-amber-600 text-white",
    },
    {
      pct: 50,
      title: "Halfway Champion",
      subtitle: "50% Principal Cleared",
      emoji: "🥈",
      color: "from-blue-500/20 to-indigo-600/10 border-blue-500/30 text-blue-700 dark:text-blue-400",
      activeBg: "bg-blue-600 text-white",
    },
    {
      pct: 75,
      title: "Freedom Near",
      subtitle: "75% Repayment Complete",
      emoji: "🥇",
      color: "from-purple-500/20 to-pink-600/10 border-purple-500/30 text-purple-700 dark:text-purple-400",
      activeBg: "bg-purple-600 text-white",
    },
    {
      pct: 100,
      title: "Debt Free Hero",
      subtitle: "100% Financial Freedom",
      emoji: "🏆",
      color: "from-emerald-500/20 to-teal-600/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
      activeBg: "bg-emerald-600 text-white",
    },
  ];

  return (
    <div className="card p-5 border border-[var(--color-border)] space-y-5 bg-[var(--color-surface)]">
      {/* Header & Overall Velocity Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🚀</span>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">Debt Reduction Velocity & Milestones</h3>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] font-medium mt-0.5">
            Track your progress toward 100% financial freedom and unlock milestone achievements.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)] block">Total Paid So Far</span>
            <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">{formatCurrency(totalPaid)}</span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 flex items-center justify-center font-black text-xs text-[var(--color-text-primary)] bg-[var(--color-surface-tertiary)]">
            {Math.round(progressPct)}%
          </div>
        </div>
      </div>

      {/* Milestone Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {milestones.map((m) => {
          const isUnlocked = progressPct >= m.pct;
          return (
            <div
              key={m.pct}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2 relative overflow-hidden ${
                isUnlocked
                  ? `bg-gradient-to-br ${m.color} shadow-sm scale-102`
                  : "bg-[var(--color-surface-secondary)] border-[var(--color-border)] opacity-60 grayscale"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{m.emoji}</span>
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  isUnlocked ? m.activeBg : "bg-[var(--color-surface-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)]"
                }`}>
                  {isUnlocked ? "Unlocked 🎉" : `${m.pct}% Target`}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-[var(--color-text-primary)]">{m.title}</h4>
                <p className="text-[10px] text-[var(--color-text-secondary)] font-medium mt-0.5">{m.subtitle}</p>
              </div>

              {/* Mini progress bar under badge */}
              <div className="w-full bg-black/10 dark:bg-white/10 h-1 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full transition-all duration-500 ${isUnlocked ? "bg-emerald-500" : "bg-slate-400"}`}
                  style={{ width: `${Math.min(100, (progressPct / m.pct) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Payoff Speed Banner */}
      <div className="p-3 rounded-xl bg-[var(--color-surface-tertiary)]/70 border border-[var(--color-border-light)] flex items-center justify-between text-xs">
        <span className="text-[var(--color-text-secondary)] font-medium">
          🔥 Payoff Speed: <strong className="text-[var(--color-text-primary)]">On Track</strong> ({data.active_loans} active loans currently being reduced)
        </span>
        <span className="font-bold text-[var(--color-primary-light)]">
          {data.closed_loans} Debt(s) Fully Cleared
        </span>
      </div>
    </div>
  );
}
