"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/utils/formatters";

export function CreditCardTrapCalculator() {
  const [balance, setBalance] = useState("50000");
  const [apr, setApr] = useState("42"); // Typical Indian credit card APR (~3.5%/month = 42%)

  const currentBalance = parseFloat(balance) || 0;
  const annualRate = parseFloat(apr) || 42;
  const monthlyRate = annualRate / 100 / 12;

  // Minimum payment: 5% of balance (or min ₹500)
  const minPayment = Math.max(500, currentBalance * 0.05);

  // Approximate minimum payment payoff time & interest
  let tempBal = currentBalance;
  let months = 0;
  let totalInterest = 0;
  while (tempBal > 100 && months < 360) {
    const interest = tempBal * monthlyRate;
    totalInterest += interest;
    const pay = Math.max(500, tempBal * 0.05);
    tempBal = tempBal + interest - pay;
    months++;
  }

  const yearsToPayoff = (months / 12).toFixed(1);

  return (
    <div className="card p-5 border border-rose-500/30 bg-gradient-to-br from-rose-500/5 via-[var(--color-surface)] to-[var(--color-surface)] space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚨</span>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Credit Card Minimum Payment Trap Calculator</h3>
            <p className="text-[11px] text-[var(--color-text-tertiary)]">See how paying only "Minimum Due" leads to 42% APR compounding debt traps</p>
          </div>
        </div>
        <span className="text-xs font-black text-rose-400 uppercase tracking-widest bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
          Compounding Trap
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">Outstanding Card Balance (₹)</label>
          <input
            type="number"
            className="input w-full text-xs h-10 font-bold text-[var(--color-text-primary)]"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="50000"
          />
        </div>
        <div>
          <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">Card Interest Rate (% APR)</label>
          <input
            type="number"
            className="input w-full text-xs h-10 font-bold text-rose-400"
            value={apr}
            onChange={(e) => setApr(e.target.value)}
            placeholder="42"
          />
        </div>
      </div>

      {/* Trap Breakdown Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
        {/* Minimum Due Trap */}
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-rose-400 uppercase text-[10px]">❌ Minimum Due Only (~₹{Math.round(minPayment)}/mo)</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-tertiary)]">Time to Payoff:</span>
              <span className="font-black text-rose-400">{yearsToPayoff} Years ({months} months)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-tertiary)]">Total Extra Interest:</span>
              <span className="font-black text-rose-500 text-sm">{formatCurrency(totalInterest)}</span>
            </div>
          </div>
        </div>

        {/* Full Payoff Advantage */}
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-emerald-400 uppercase text-[10px]">✅ Pay Full Balance ({formatCurrency(currentBalance)})</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-tertiary)]">Time to Payoff:</span>
              <span className="font-black text-emerald-400">Immediate (1 Month)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-tertiary)]">Total Interest Saved:</span>
              <span className="font-black text-emerald-400 text-sm">{formatCurrency(totalInterest)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
