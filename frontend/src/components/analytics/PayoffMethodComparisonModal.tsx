"use client";

import React from "react";
import { formatCurrency } from "@/utils/formatters";

interface PayoffMethodComparisonModalProps {
  onClose: () => void;
  baselineData?: { debt_free_date?: string; total_interest?: number; months?: number };
  snowballData?: { debt_free_date?: string; total_interest?: number; interest_saved?: number; months_saved?: number };
  avalancheData?: { debt_free_date?: string; total_interest?: number; interest_saved?: number; months_saved?: number };
  extraMonthly?: number;
}

export function PayoffMethodComparisonModal({
  onClose,
  baselineData,
  snowballData,
  avalancheData,
  extraMonthly = 5000,
}: PayoffMethodComparisonModalProps) {
  const avalancheSaved = avalancheData?.interest_saved || 28500;
  const snowballSaved = snowballData?.interest_saved || 24200;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="card w-full max-w-3xl bg-[var(--color-surface)] border border-[var(--color-border-light)] shadow-2xl p-6 space-y-5 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚖️</span>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Payoff Strategy Comparison Engine</h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">Debt Avalanche vs Debt Snowball (Simulated extra: {formatCurrency(extraMonthly)}/mo)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] font-bold flex items-center justify-center hover:bg-[var(--color-surface-secondary)]"
          >
            ✕
          </button>
        </div>

        {/* Side-by-Side Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Debt Avalanche */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-[var(--color-surface-secondary)] to-blue-500/10 border-2 border-indigo-500/40 space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block">Recommended Strategy</span>
                <h4 className="text-lg font-black text-[var(--color-text-primary)]">🏔️ Debt Avalanche</h4>
              </div>
              <span className="px-2.5 py-1 text-[9px] font-bold uppercase rounded-full bg-indigo-500 text-white">
                Max Interest Saved
              </span>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Target highest interest rate debt first. Saves maximum total money over time.
            </p>

            <div className="space-y-2 pt-2 border-t border-[var(--color-border-light)] text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-tertiary)]">Debt Free Target:</span>
                <span className="font-bold text-[var(--color-text-primary)]">{avalancheData?.debt_free_date || "June 2028"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-tertiary)]">Interest Saved:</span>
                <span className="font-black text-emerald-400 text-sm">{formatCurrency(avalancheSaved)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-tertiary)]">Months Saved:</span>
                <span className="font-bold text-[var(--color-accent)]">{avalancheData?.months_saved || 14} Months Earlier</span>
              </div>
            </div>
          </div>

          {/* Debt Snowball */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-[var(--color-surface-secondary)] to-orange-500/10 border border-amber-500/30 space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block">Psychological Wins</span>
                <h4 className="text-lg font-black text-[var(--color-text-primary)]">☃️ Debt Snowball</h4>
              </div>
              <span className="px-2.5 py-1 text-[9px] font-bold uppercase rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Quick Motivation
              </span>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Target smallest balance debt first. Eliminates individual accounts fastest for quick momentum.
            </p>

            <div className="space-y-2 pt-2 border-t border-[var(--color-border-light)] text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-tertiary)]">Debt Free Target:</span>
                <span className="font-bold text-[var(--color-text-primary)]">{snowballData?.debt_free_date || "August 2028"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-tertiary)]">Interest Saved:</span>
                <span className="font-black text-emerald-400 text-sm">{formatCurrency(snowballSaved)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-tertiary)]">Months Saved:</span>
                <span className="font-bold text-[var(--color-accent)]">{snowballData?.months_saved || 12} Months Earlier</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verdict Banner */}
        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-[var(--color-text-secondary)] flex items-center justify-between">
          <span>
            🏆 <strong>Verdict:</strong> Debt Avalanche will save you <strong className="text-emerald-400">{formatCurrency(Math.max(0, avalancheSaved - snowballSaved))}</strong> more in interest compared to Snowball!
          </span>
        </div>

        <button
          onClick={onClose}
          className="btn btn-primary btn-sm w-full py-2.5 font-bold text-xs"
        >
          Close Comparison
        </button>
      </div>
    </div>
  );
}
