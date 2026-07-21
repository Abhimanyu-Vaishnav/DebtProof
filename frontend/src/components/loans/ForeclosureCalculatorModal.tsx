"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/utils/formatters";
import type { Loan } from "@/types";

interface ForeclosureCalculatorModalProps {
  loan: Loan;
  onClose: () => void;
}

export function ForeclosureCalculatorModal({ loan, onClose }: ForeclosureCalculatorModalProps) {
  const outstanding = parseFloat(loan.outstanding_amount) || 100000;
  const interestRate = parseFloat(loan.interest_rate) || 12;
  const currentEmi = parseFloat(loan.monthly_emi) || 5000;
  const remainingMonths = 24;

  const [partPayment, setPartPayment] = useState("50000");

  const lumpSum = parseFloat(partPayment) || 0;
  const newOutstanding = Math.max(0, outstanding - lumpSum);

  // Approximate interest savings calculation
  const monthlyRate = interestRate / 100 / 12;
  const currentTotalInterest = (currentEmi * remainingMonths) - outstanding;
  
  // New tenure with same EMI
  let tempBal = newOutstanding;
  let newMonths = 0;
  let newTotalInterest = 0;
  while (tempBal > 0 && newMonths < 360) {
    const interest = tempBal * monthlyRate;
    newTotalInterest += interest;
    tempBal = tempBal + interest - currentEmi;
    newMonths++;
  }

  const interestSaved = Math.max(0, currentTotalInterest - newTotalInterest);
  const tenureSavedMonths = Math.max(0, remainingMonths - newMonths);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="card w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border-light)] shadow-2xl p-6 space-y-5 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Pre-Payment & Foreclosure Savings</h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">{loan.name} ({loan.lender_name})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] font-bold flex items-center justify-center hover:bg-[var(--color-surface-secondary)]"
          >
            ✕
          </button>
        </div>

        {/* Current State Summary */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-[var(--color-surface-secondary)] p-3.5 rounded-xl border border-[var(--color-border-light)]">
          <div>
            <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold">Current Outstanding</span>
            <p className="text-sm font-bold text-[var(--color-text-primary)]">{formatCurrency(outstanding)}</p>
          </div>
          <div>
            <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold">Current Interest Rate</span>
            <p className="text-sm font-bold text-[var(--color-accent)]">{interestRate}% APR</p>
          </div>
        </div>

        {/* Input Lump Sum Amount */}
        <div>
          <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">Lump-Sum Part Pre-Payment Amount (₹)</label>
          <div className="relative">
            <input
              type="number"
              className="input w-full text-sm h-11 font-bold text-[var(--color-primary)]"
              value={partPayment}
              onChange={(e) => setPartPayment(e.target.value)}
              placeholder="50000"
            />
          </div>
          <div className="flex gap-2 mt-2">
            {[10000, 25000, 50000, outstanding].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setPartPayment(amt.toString())}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] hover:bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]"
              >
                {amt === outstanding ? "Full Foreclose" : `+₹${amt.toLocaleString("en-IN")}`}
              </button>
            ))}
          </div>
        </div>

        {/* Calculated Savings Breakdown */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-[var(--color-surface-secondary)] to-emerald-500/5 border border-emerald-500/30 space-y-3">
          <div className="flex justify-between items-center border-b border-emerald-500/20 pb-2">
            <span className="text-xs font-extrabold uppercase text-emerald-400">Total Pre-Payment Savings</span>
            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
              {lumpSum >= outstanding ? "100% Debt Free!" : "Tenure Reduced"}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-tertiary)]">Revised Outstanding:</span>
              <span className="font-bold text-[var(--color-text-primary)]">{formatCurrency(newOutstanding)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-tertiary)]">Net Interest Saved:</span>
              <span className="font-black text-emerald-400 text-sm">{formatCurrency(interestSaved)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-tertiary)]">Tenure Reduced By:</span>
              <span className="font-bold text-[var(--color-primary-light)]">{tenureSavedMonths} Months Earlier</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn btn-primary btn-sm w-full py-2.5 font-bold text-xs"
        >
          Close Calculator
        </button>
      </div>
    </div>
  );
}
