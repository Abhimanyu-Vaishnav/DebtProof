"use client";

import React from "react";
import { Topbar } from "@/components/layout/Topbar";
import { StatementImportStudio } from "@/components/statement-import/StatementImportStudio";

export default function StatementImportPage() {
  return (
    <>
      <Topbar
        title="Bank Statement & AA Auto-Import"
        subtitle="Auto-extract recurring loan EMIs & credit card bills from PDF statements"
      />

      <main className="page-content space-y-6 pb-12">
        {/* Top Banner */}
        <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-6 md:p-8 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                📄 AI Statement Parser & AA Stream
              </span>
              <span className="text-xs text-[var(--color-text-tertiary)] font-mono font-bold">Client-Side Extraction</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
              Account Aggregator & Bank Statement Auto-Import Parser
            </h1>

            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-medium">
              Upload bank PDF statements or connect via the RBI Account Aggregator (AA) sandbox framework. Automatically parse recurring EMI debits, credit card bill dues, and salary deposits with 1-click sync to your DebtProof portfolio.
            </p>
          </div>
        </div>

        {/* Main Statement Import Studio Component */}
        <StatementImportStudio />
      </main>
    </>
  );
}
