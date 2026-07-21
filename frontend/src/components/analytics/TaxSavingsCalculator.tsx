"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/utils/formatters";

export function TaxSavingsCalculator() {
  const [homeInterest, setHomeInterest] = useState("180000");
  const [section80cPrincipal, setSection80cPrincipal] = useState("150000");
  const [taxSlab, setTaxSlab] = useState("30");

  const interestDeduction = Math.min(200000, parseFloat(homeInterest) || 0);
  const principalDeduction = Math.min(150000, parseFloat(section80cPrincipal) || 0);
  const totalDeduction = interestDeduction + principalDeduction;

  const slabMultiplier = (parseFloat(taxSlab) || 0) / 100;
  const estimatedTaxSavings = totalDeduction * slabMultiplier;

  return (
    <div className="card p-5 border border-[var(--color-border-light)] space-y-4 bg-gradient-to-br from-emerald-950/20 via-[var(--color-surface)] to-[var(--color-surface-secondary)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏛️</span>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Income Tax Savings Calculator (India)</h3>
            <p className="text-[11px] text-[var(--color-text-tertiary)]">Section 24(B) Home Loan interest & 80C principal tax benefits</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Tax Saver
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">Home Loan Annual Interest (₹)</label>
          <input
            type="number"
            className="input w-full text-xs h-10"
            value={homeInterest}
            onChange={(e) => setHomeInterest(e.target.value)}
            placeholder="e.g. 180000"
          />
          <span className="text-[9px] text-[var(--color-text-tertiary)] mt-0.5 block">Max Sec 24B cap: ₹2,00,000</span>
        </div>

        <div>
          <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">Principal Repayment (₹)</label>
          <input
            type="number"
            className="input w-full text-xs h-10"
            value={section80cPrincipal}
            onChange={(e) => setSection80cPrincipal(e.target.value)}
            placeholder="e.g. 150000"
          />
          <span className="text-[9px] text-[var(--color-text-tertiary)] mt-0.5 block">Max Sec 80C cap: ₹1,50,000</span>
        </div>

        <div>
          <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">Your Income Tax Bracket</label>
          <select
            className="input w-full text-xs h-10 bg-[var(--color-surface)]"
            value={taxSlab}
            onChange={(e) => setTaxSlab(e.target.value)}
          >
            <option value="10">10% Tax Bracket</option>
            <option value="20">20% Tax Bracket</option>
            <option value="30">30% Tax Bracket (High Earner)</option>
          </select>
          <span className="text-[9px] text-[var(--color-text-tertiary)] mt-0.5 block">Old/New Regime Tier</span>
        </div>
      </div>

      {/* Result Display */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">Estimated Tax Savings / Year</span>
          <span className="text-xl font-black text-[var(--color-text-primary)]">{formatCurrency(estimatedTaxSavings)}</span>
        </div>
        <div className="text-left sm:text-right text-[10px] text-[var(--color-text-tertiary)] space-y-0.5">
          <p>Eligible Deduction: <strong>{formatCurrency(totalDeduction)}</strong></p>
          <p>Effective Tax Relief at {taxSlab}% bracket</p>
        </div>
      </div>
    </div>
  );
}
