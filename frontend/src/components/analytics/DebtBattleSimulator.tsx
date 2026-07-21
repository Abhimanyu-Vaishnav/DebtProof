"use client";

import React, { useState, useEffect, useMemo } from "react";
import { formatCurrency } from "@/utils/formatters";
import type { DashboardData } from "@/types";
import { loansService } from "@/services/loans.service";

interface SimulatorProps {
  data: DashboardData;
}

interface LoanSim {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumEMI: number;
}

interface SimResult {
  months: number;
  totalInterest: number;
  payoffOrder: string[];
}

function runSimulation(loans: LoanSim[], extraPayment: number, strategy: "snowball" | "avalanche"): SimResult {
  let remaining = loans.map((l) => ({ ...l }));
  let months = 0;
  let totalInterest = 0;
  const payoffOrder: string[] = [];
  const sortFn = strategy === "snowball"
    ? (a: LoanSim, b: LoanSim) => a.balance - b.balance
    : (a: LoanSim, b: LoanSim) => b.interestRate - a.interestRate;
  remaining.sort(sortFn);

  const MAX_MONTHS = 600;
  while (remaining.length > 0 && months < MAX_MONTHS) {
    months++;
    let extra = extraPayment;
    for (const loan of remaining) {
      const monthlyInterest = (loan.balance * loan.interestRate) / 100 / 12;
      totalInterest += monthlyInterest;
      loan.balance += monthlyInterest;
      loan.balance -= loan.minimumEMI;
      if (loan.balance < 0) loan.balance = 0;
    }
    if (remaining.length > 0 && extra > 0) {
      remaining[0].balance -= extra;
      if (remaining[0].balance < 0) remaining[0].balance = 0;
    }
    const paidOff = remaining.filter((l) => l.balance <= 0);
    paidOff.forEach((l) => payoffOrder.push(l.name));
    remaining = remaining.filter((l) => l.balance > 0);
    remaining.sort(sortFn);
    // Snowball effect: freed EMIs go to extra next round (already handled by extra being constant + minimums freed)
    extra += paidOff.reduce((sum, l) => sum + l.minimumEMI, 0);
  }

  return { months, totalInterest, payoffOrder };
}

export function DebtBattleSimulator({ data }: SimulatorProps) {
  const [extraPayment, setExtraPayment] = useState(2000);
  const [showDetails, setShowDetails] = useState(false);
  const [loans, setLoans] = useState<LoanSim[]>([]);

  useEffect(() => {
    loansService.getLoans({ status: "active", page_size: 50 }).then((res) => {
      setLoans(
        (res.results ?? []).map((l) => ({
          id: l.id,
          name: l.name,
          balance: parseFloat(l.outstanding_amount) || 0,
          interestRate: parseFloat(l.interest_rate) || 0,
          minimumEMI: parseFloat(l.monthly_emi) || 1000,
        })).filter((l) => l.balance > 0)
      );
    }).catch(() => {/* silent */});
  }, []);

  const snowball = useMemo(() => runSimulation(loans, extraPayment, "snowball"), [loans, extraPayment]);
  const avalanche = useMemo(() => runSimulation(loans, extraPayment, "avalanche"), [loans, extraPayment]);

  const interestSaved = snowball.totalInterest - avalanche.totalInterest;
  const monthsSaved = snowball.months - avalanche.months;

  // Use backend simulations for the 0-extra-payment comparison banner
  const backendSnowballSaved = data.simulations?.snowball?.interest_saved ?? 0;
  const backendAvalancheSaved = data.simulations?.avalanche?.interest_saved ?? 0;

  if (loans.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-2xl mb-2">🧊🔥</p>
        <p className="text-sm font-bold text-[var(--color-text-primary)]">Debt Battle Simulator</p>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">No active loans to simulate. Add loans to compare strategies.</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-blue-400 to-orange-500" />
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Debt Battle Simulator</h3>
            <p className="text-[11px] text-[var(--color-text-tertiary)]">❄️ Snowball vs 🔥 Avalanche — Interactive</p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails((v) => !v)}
          className="text-[11px] font-semibold text-[var(--color-primary-light)] hover:underline"
        >
          {showDetails ? "Hide Order" : "Payoff Order"}
        </button>
      </div>

      {/* Backend Insight Strip */}
      {(backendSnowballSaved > 0 || backendAvalancheSaved > 0) && (
        <div className="flex items-center gap-3 bg-[var(--color-surface-secondary)] rounded-xl px-4 py-2.5 mb-5 text-xs">
          <span className="text-[var(--color-text-tertiary)] font-medium shrink-0">Backend estimate:</span>
          <span className="text-blue-400 font-bold">❄️ Snowball saves {formatCurrency(backendSnowballSaved)}</span>
          <span className="text-[var(--color-border)]">·</span>
          <span className="text-orange-400 font-bold">🔥 Avalanche saves {formatCurrency(backendAvalancheSaved)}</span>
        </div>
      )}

      {/* Extra Payment Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
            Extra Monthly Payment
          </label>
          <span className="text-sm font-bold text-[var(--color-primary)]">
            {formatCurrency(extraPayment)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={50000}
          step={500}
          value={extraPayment}
          onChange={(e) => setExtraPayment(Number(e.target.value))}
          className="w-full h-2 rounded-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${(extraPayment / 50000) * 100}%, var(--color-surface-tertiary) ${(extraPayment / 50000) * 100}%, var(--color-surface-tertiary) 100%)`,
            accentColor: "var(--color-primary)",
          }}
        />
        <div className="flex justify-between text-[10px] text-[var(--color-text-tertiary)] mt-1">
          <span>₹0 (min only)</span>
          <span>₹50,000/mo extra</span>
        </div>
      </div>

      {/* Battle Cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Snowball */}
        <div className={`relative rounded-xl p-4 text-center overflow-hidden border ${monthsSaved < 0 ? "border-blue-500/40 bg-blue-500/15 ring-2 ring-blue-400/30" : "border-blue-500/20 bg-blue-500/10"}`}>
          {monthsSaved < 0 && (
            <span className="absolute top-2 left-2 text-[9px] font-black text-blue-300 bg-blue-500/20 rounded-full px-2 py-0.5 uppercase tracking-wider">Winner!</span>
          )}
          <p className="text-base font-black text-[var(--color-text-primary)] mt-3 mb-0.5">❄️ Snowball</p>
          <p className="text-[10px] text-[var(--color-text-tertiary)] mb-3">Smallest balance first</p>
          <p className="text-2xl font-black text-blue-400">{snowball.months}m</p>
          <p className="text-[10px] text-blue-300 mb-2">to debt free</p>
          <p className="text-xs font-bold text-[var(--color-text-secondary)]">{formatCurrency(snowball.totalInterest)}</p>
          <p className="text-[10px] text-[var(--color-text-tertiary)]">total interest</p>
        </div>

        {/* Avalanche */}
        <div className={`relative rounded-xl p-4 text-center overflow-hidden border ${monthsSaved > 0 ? "border-orange-500/40 bg-orange-500/15 ring-2 ring-orange-400/30" : "border-orange-500/20 bg-orange-500/10"}`}>
          {monthsSaved > 0 && (
            <span className="absolute top-2 left-2 text-[9px] font-black text-orange-300 bg-orange-500/20 rounded-full px-2 py-0.5 uppercase tracking-wider">Winner!</span>
          )}
          <p className="text-base font-black text-[var(--color-text-primary)] mt-3 mb-0.5">🔥 Avalanche</p>
          <p className="text-[10px] text-[var(--color-text-tertiary)] mb-3">Highest rate first</p>
          <p className="text-2xl font-black text-orange-400">{avalanche.months}m</p>
          <p className="text-[10px] text-orange-300 mb-2">to debt free</p>
          <p className="text-xs font-bold text-[var(--color-text-secondary)]">{formatCurrency(avalanche.totalInterest)}</p>
          <p className="text-[10px] text-[var(--color-text-tertiary)]">total interest</p>
        </div>
      </div>

      {/* Winner Banner */}
      <div className={`rounded-xl px-4 py-3 text-center ${Math.abs(interestSaved) < 1 ? "bg-[var(--color-surface-secondary)]" : interestSaved > 0 ? "bg-orange-500/10 border border-orange-500/20" : "bg-blue-500/10 border border-blue-500/20"}`}>
        {Math.abs(interestSaved) < 1 ? (
          <p className="text-xs font-bold text-[var(--color-text-secondary)]">⚖️ Both strategies identical for your debt profile</p>
        ) : interestSaved > 0 ? (
          <>
            <p className="text-sm font-extrabold text-orange-400">🔥 Avalanche saves {formatCurrency(interestSaved)}</p>
            <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
              Debt-free {monthsSaved > 0 ? `${monthsSaved} months sooner` : "in the same time"} — mathematically optimal!
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-extrabold text-blue-400">❄️ Snowball saves {formatCurrency(-interestSaved)}</p>
            <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
              Debt-free {Math.abs(monthsSaved) > 0 ? `${Math.abs(monthsSaved)} months sooner` : "in the same time"} — smaller balances win here!
            </p>
          </>
        )}
      </div>

      {/* Payoff Order Details */}
      {showDetails && (
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[var(--color-border-light)]">
          <div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">❄️ Snowball Payoff Order</p>
            {snowball.payoffOrder.slice(0, 8).map((name, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-[11px] text-[var(--color-text-secondary)] truncate">{name}</span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-2">🔥 Avalanche Payoff Order</p>
            {avalanche.payoffOrder.slice(0, 8).map((name, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-[11px] text-[var(--color-text-secondary)] truncate">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
