"use client";

import React from "react";
import { Topbar } from "@/components/layout/Topbar";
import { MicroAutoSaverStudio } from "@/components/auto-saver/MicroAutoSaverStudio";

export default function AutoSaverPage() {
  return (
    <>
      <Topbar
        title="Micro-Prepayment Auto-Saver"
        subtitle="Auto-sweep daily spare change to shave years off loan principal"
      />

      <main className="page-content space-y-6 pb-12">
        {/* Top Banner */}
        <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-6 md:p-8 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                🌱 Automated Micro-Prepayments
              </span>
              <span className="text-xs text-[var(--color-text-tertiary)] font-mono font-bold">Monad Micro-Vault Engine</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
              Spare-Change Round-Up & Micro Auto-Saver
            </h1>

            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-medium">
              Set up automated daily micro-prepayments ($1/day or ₹50/day) targeting your long-term bank loans. Accelerate your debt-free milestone, slash years of interest burn, and anchor your micro-vault rules on the Monad Blockchain.
            </p>
          </div>
        </div>

        {/* Main Auto-Saver Studio Component */}
        <MicroAutoSaverStudio />
      </main>
    </>
  );
}
