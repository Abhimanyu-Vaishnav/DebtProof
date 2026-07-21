"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/utils/formatters";

interface RefinancingCalculatorModalProps {
  onClose: () => void;
  currentOutstanding?: number;
}

export function RefinancingCalculatorModal({
  onClose,
  currentOutstanding = 650000,
}: RefinancingCalculatorModalProps) {
  const [balance, setBalance] = useState(currentOutstanding.toString());
  const [currentAvgRate, setCurrentAvgRate] = useState("14.50");
  const [targetRate, setTargetRate] = useState("9.25");
  const [tenureYears, setTenureYears] = useState("3");
  const [processingFeePct, setProcessingFeePct] = useState("1.0");

  const p = parseFloat(balance) || 0;
  const oldRate = (parseFloat(currentAvgRate) || 0) / 100 / 12;
  const newRate = (parseFloat(targetRate) || 0) / 100 / 12;
  const n = (parseFloat(tenureYears) || 1) * 12;
  const feePct = (parseFloat(processingFeePct) || 0) / 100;

  // Monthly EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const calcEmi = (principal: number, r: number, months: number) => {
    if (r === 0 || months === 0) return principal / (months || 1);
    const factor = Math.pow(1 + r, months);
    return (principal * r * factor) / (factor - 1);
  };

  const oldEmi = calcEmi(p, oldRate, n);
  const newEmi = calcEmi(p, newRate, n);
  const processingFee = p * feePct;

  const totalOldCost = oldEmi * n;
  const totalNewCost = newEmi * n + processingFee;
  const netSavings = Math.max(0, totalOldCost - totalNewCost);
  const emiSavingsMonthly = Math.max(0, oldEmi - newEmi);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="card w-full max-w-xl bg-[var(--color-surface)] border border-[var(--color-border-light)] shadow-2xl p-6 space-y-5 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔄</span>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Loan Refinancing & Consolidation Calculator</h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">Evaluate interest savings from balance transfer consolidation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] font-bold flex items-center justify-center hover:bg-[var(--color-surface-secondary)]"
          >
            ✕
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="col-span-2 sm:col-span-1">
            <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">Total Balance to Consolidate (₹)</label>
            <input
              type="number"
              className="input w-full text-xs h-10"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">Consolidation Tenure (Years)</label>
            <input
              type="number"
              className="input w-full text-xs h-10"
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">Current Weighted Rate (%)</label>
            <input
              type="number"
              step="0.1"
              className="input w-full text-xs h-10"
              value={currentAvgRate}
              onChange={(e) => setCurrentAvgRate(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">Refinanced Target Rate (%)</label>
            <input
              type="number"
              step="0.1"
              className="input w-full text-xs h-10 text-[var(--color-accent)] font-bold"
              value={targetRate}
              onChange={(e) => setTargetRate(e.target.value)}
            />
          </div>
        </div>

        {/* Live Comparison Output */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 via-[var(--color-surface-secondary)] to-purple-500/10 border border-indigo-500/20 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-light)]">
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-tertiary)] block">Current Monthly EMI</span>
              <span className="text-base font-bold text-[var(--color-error)]">{formatCurrency(oldEmi)}</span>
            </div>
            <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-light)]">
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-tertiary)] block">New Refinanced EMI</span>
              <span className="text-base font-bold text-[var(--color-accent)]">{formatCurrency(newEmi)}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block">Total Net Savings (After Fees)</span>
              <span className="text-xl font-black text-emerald-400">{formatCurrency(netSavings)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[var(--color-text-tertiary)] block">Monthly EMI Savings</span>
              <span className="font-bold text-white text-xs">{formatCurrency(emiSavingsMonthly)} / mo</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn btn-primary btn-sm w-full py-2.5 font-bold text-xs"
        >
          Got It, Thanks!
        </button>
      </div>
    </div>
  );
}
