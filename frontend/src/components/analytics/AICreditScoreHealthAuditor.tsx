"use client";

import React, { useState } from "react";

export function AICreditScoreHealthAuditor() {
  const [creditScore, setCreditScore] = useState<number>(742);

  const getScoreRating = (score: number) => {
    if (score >= 770) return { text: "Excellent 🌟", color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/30" };
    if (score >= 700) return { text: "Good 👍", color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30" };
    if (score >= 650) return { text: "Average ⚠️", color: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/30" };
    return { text: "Needs Improvement 🔴", color: "text-rose-400", bg: "bg-rose-500/20 border-rose-500/30" };
  };

  const rating = getScoreRating(creditScore);

  return (
    <div className="card p-6 border-2 border-blue-500/30 bg-gradient-to-r from-blue-950/20 via-[var(--color-surface)] to-[var(--color-surface)] space-y-5 rounded-2xl shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--color-border-light)] pb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📈</span>
          <div>
            <h3 className="text-base font-black text-[var(--color-text-primary)]">
              AI Credit Score Booster & Health Auditor
            </h3>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Real-time credit profile analysis, utilization ratio optimization & boost action plan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${rating.bg} ${rating.color}`}>
            {rating.text}
          </span>
        </div>
      </div>

      {/* Credit Score Gauge Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center font-mono text-xs">
          <span className="text-[var(--color-text-secondary)] font-bold">Estimated Credit Score: <strong className="text-xl font-black text-blue-400">{creditScore} / 900</strong></span>
          <span className="text-[var(--color-text-tertiary)]">+28 pts potential boost</span>
        </div>

        <input
          type="range"
          min={500}
          max={850}
          value={creditScore}
          onChange={(e) => setCreditScore(Number(e.target.value))}
          className="w-full accent-blue-500 cursor-pointer h-2 bg-blue-950 rounded-lg"
        />

        <div className="flex justify-between text-[10px] font-mono text-[var(--color-text-tertiary)]">
          <span>300 (Poor)</span>
          <span>650 (Fair)</span>
          <span>750 (Good)</span>
          <span>850+ (Excellent)</span>
        </div>
      </div>

      {/* Action Plan Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-1">
          <span className="text-[9px] font-bold text-emerald-400 uppercase block">1. Credit Utilization Ratio</span>
          <p className="font-bold text-[var(--color-text-primary)]">Maintain under 30%</p>
          <p className="text-[10px] text-[var(--color-text-tertiary)]">Current: 24.5% (Optimal Range)</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-1">
          <span className="text-[9px] font-bold text-indigo-400 uppercase block">2. On-Time Payment Streak</span>
          <p className="font-bold text-[var(--color-text-primary)]">100% Verified Track Record</p>
          <p className="text-[10px] text-[var(--color-text-tertiary)]">Monad Blockchain Proof Active</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-1">
          <span className="text-[9px] font-bold text-purple-400 uppercase block">3. Credit Mix Multiplier</span>
          <p className="font-bold text-[var(--color-text-primary)]">Balanced Secured/Unsecured</p>
          <p className="text-[10px] text-[var(--color-text-tertiary)]">+15 pts score boost</p>
        </div>
      </div>
    </div>
  );
}

export default AICreditScoreHealthAuditor;
