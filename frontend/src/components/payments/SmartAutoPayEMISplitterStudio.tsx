"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/utils/formatters";

export function SmartAutoPayEMISplitterStudio() {
  const [totalPoolAmount, setTotalPoolAmount] = useState<number>(35000);
  const [strategy, setStrategy] = useState<"avalanche" | "snowball" | "equal">("avalanche");
  const [autoPayEnabled, setAutoPayEnabled] = useState<boolean>(true);

  // Mock Active Loans
  const loans = [
    { id: "1", name: "ICICI Credit Card", principal: 120000, rate: 36.0, minEmi: 6000 },
    { id: "2", name: "HDFC Personal Loan", principal: 250000, rate: 14.5, minEmi: 8500 },
    { id: "3", name: "SBI Auto Loan", principal: 480000, rate: 9.2, minEmi: 12400 },
  ];

  const totalMinEmi = loans.reduce((acc, curr) => acc + curr.minEmi, 0); // 26,900
  const surplus = Math.max(0, totalPoolAmount - totalMinEmi);

  // Split calculations
  const calculateSplit = () => {
    let sorted = [...loans];
    if (strategy === "avalanche") {
      sorted.sort((a, b) => b.rate - a.rate); // Highest interest first
    } else if (strategy === "snowball") {
      sorted.sort((a, b) => a.principal - b.principal); // Lowest balance first
    }

    return loans.map((loan) => {
      let extra = 0;
      if (strategy === "equal") {
        extra = Math.round(surplus / loans.length);
      } else if (loan.id === sorted[0].id) {
        extra = surplus;
      }
      return {
        ...loan,
        allocatedAmount: loan.minEmi + extra,
        extraContribution: extra,
      };
    });
  };

  const splitResult = calculateSplit();

  return (
    <div className="card p-6 border-2 border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 via-[var(--color-surface)] to-[var(--color-surface)] space-y-5 rounded-2xl shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--color-border-light)] pb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <h3 className="text-base font-black text-[var(--color-text-primary)]">
              Smart Auto-Pay & Dynamic EMI Splitter Studio
            </h3>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Automatically distributes your monthly budget surplus to maximize interest savings or payoff speed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold text-[var(--color-text-secondary)]">Auto-Debit Splitter</span>
          <button
            onClick={() => setAutoPayEnabled(!autoPayEnabled)}
            className={`w-12 h-6 rounded-full p-1 transition-all cursor-pointer ${
              autoPayEnabled ? "bg-emerald-500" : "bg-gray-600"
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-all ${autoPayEnabled ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {/* Control Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-2">
          <label className="font-bold text-[var(--color-text-secondary)] uppercase text-[10px]">Monthly Debt Budget Pool (₹)</label>
          <input
            type="number"
            value={totalPoolAmount}
            onChange={(e) => setTotalPoolAmount(Number(e.target.value))}
            className="form-input text-xs w-full font-bold font-mono"
            step={1000}
          />
          <div className="flex justify-between text-[10px] text-[var(--color-text-tertiary)] pt-1">
            <span>Minimum Required EMI: ₹{totalMinEmi.toLocaleString()}</span>
            <span className="text-emerald-400 font-bold">Surplus: +₹{surplus.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-2">
          <label className="font-bold text-[var(--color-text-secondary)] uppercase text-[10px]">Auto-Allocation Strategy</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setStrategy("avalanche")}
              className={`py-1.5 rounded-lg border font-bold text-[11px] ${
                strategy === "avalanche" ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "border-[var(--color-border)]"
              }`}
            >
              Avalanche
            </button>
            <button
              onClick={() => setStrategy("snowball")}
              className={`py-1.5 rounded-lg border font-bold text-[11px] ${
                strategy === "snowball" ? "bg-purple-500/20 border-purple-500 text-purple-400" : "border-[var(--color-border)]"
              }`}
            >
              Snowball
            </button>
            <button
              onClick={() => setStrategy("equal")}
              className={`py-1.5 rounded-lg border font-bold text-[11px] ${
                strategy === "equal" ? "bg-teal-500/20 border-teal-500 text-teal-400" : "border-[var(--color-border)]"
              }`}
            >
              Equal Split
            </button>
          </div>
        </div>
      </div>

      {/* Split Allocation Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">Optimized Dynamic Payment Distribution</h4>
        <div className="space-y-2">
          {splitResult.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border-light)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 font-mono text-xs"
            >
              <div>
                <p className="font-bold text-[var(--color-text-primary)]">{item.name}</p>
                <p className="text-[10px] text-[var(--color-text-tertiary)]">Base EMI: ₹{item.minEmi.toLocaleString()} · Rate: {item.rate}% APR</p>
              </div>

              <div className="flex items-center gap-3 text-right">
                {item.extraContribution > 0 && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                    +₹{item.extraContribution.toLocaleString()} Extra
                  </span>
                )}
                <div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase block">Allocated Payment</span>
                  <span className="text-sm font-black text-indigo-400">₹{item.allocatedAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SmartAutoPayEMISplitterStudio;
