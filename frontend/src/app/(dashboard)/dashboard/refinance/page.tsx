"use client";

import React from "react";
import { Topbar } from "@/components/layout/Topbar";
import { RefinanceSavingsStudio } from "@/components/refinance/RefinanceSavingsStudio";

export default function RefinancePage() {
  return (
    <>
      <Topbar
        title="Refinance & Balance Transfer Studio"
        subtitle="Analyze high-APR loans & calculate lifetime interest savings"
      />

      <main className="page-content space-y-6 pb-12">
        {/* Top Banner */}
        <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-6 md:p-8 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                🔄 Debt Consolidation & Refinancing
              </span>
              <span className="text-xs text-[var(--color-text-tertiary)] font-mono font-bold">Interest Savings Engine</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
              Automated Refinancing & Balance Transfer Studio
            </h1>

            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-medium">
              Scan your active high-APR bank loans and revolving credit card debts. Calculate exact lifetime interest savings, monthly cash flow drops, and break-even timelines by consolidating into lower interest rate balance transfer offers or P2P Web3 lending pools.
            </p>
          </div>
        </div>

        {/* Main Refinance Studio Component */}
        <RefinanceSavingsStudio />
      </main>
    </>
  );
}
