"use client";

import React, { useState, useEffect } from "react";
import { loansService } from "@/services/loans.service";
import { creditCardsService } from "@/services/credit-cards.service";
import { formatCurrency } from "@/utils/formatters";
import { playSuccessSound, playClickSound } from "@/utils/sound";
import { useRouter } from "next/navigation";

interface RefinanceCandidate {
  id: string;
  name: string;
  type: "loan" | "card" | "custom";
  balance: number;
  rate: number;
  emi: number;
  isSelected: boolean;
}

export function RefinanceSavingsStudio() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<RefinanceCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Custom loan add form
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customBalance, setCustomBalance] = useState("200000");
  const [customRate, setCustomRate] = useState("16.5");
  const [customEmi, setCustomEmi] = useState("7200");

  // Simulation inputs
  const [targetRatePct, setTargetRatePct] = useState<number>(9.5);
  const [tenureYears, setTenureYears] = useState<number>(3);
  const [processingFeePct, setProcessingFeePct] = useState<number>(1.0);
  const [preclosureFeePct, setPreclosureFeePct] = useState<number>(0.5);

  const [appliedDeal, setAppliedDeal] = useState<boolean>(false);

  useEffect(() => {
    async function loadLiabilities() {
      setLoading(true);
      try {
        const [loansRes, cardsRes] = await Promise.allSettled([
          loansService.getLoans(),
          creditCardsService.getCards(),
        ]);

        const list: RefinanceCandidate[] = [];

        if (loansRes.status === "fulfilled" && loansRes.value?.results) {
          loansRes.value.results.forEach((l: any) => {
            if (l.status === "active") {
              const bal = parseFloat(l.outstanding_amount) || 0;
              const rate = parseFloat(l.interest_rate) || 12;
              const emi = parseFloat(l.monthly_emi) || 0;
              if (bal > 0) {
                list.push({
                  id: l.id,
                  name: l.name || "Personal Loan",
                  type: "loan",
                  balance: bal,
                  rate,
                  emi,
                  isSelected: rate > 10,
                });
              }
            }
          });
        }

        if (cardsRes.status === "fulfilled" && cardsRes.value) {
          const cardsList = Array.isArray(cardsRes.value) ? cardsRes.value : (cardsRes.value as any).results || [];
          cardsList.forEach((c: any) => {
            const bal = parseFloat(c.current_outstanding || c.current_balance) || 0;
            const rate = parseFloat(c.interest_rate || c.apr) || 36.0;
            const emi = parseFloat(c.minimum_due) || bal * 0.05;
            if (bal > 0) {
              list.push({
                id: c.id,
                name: `${c.bank_name || "Credit Card"} (${c.card_name || "Card"})`,
                type: "card",
                balance: bal,
                rate,
                emi,
                isSelected: true,
              });
            }
          });
        }

        // Fallback default candidates if user portfolio is empty
        if (list.length === 0) {
          list.push(
            {
              id: "demo-1",
              name: "HDFC Personal Loan",
              type: "loan",
              balance: 450000,
              rate: 14.5,
              emi: 15480,
              isSelected: true,
            },
            {
              id: "demo-2",
              name: "ICICI Sapphiro Credit Card",
              type: "card",
              balance: 180000,
              rate: 42.0,
              emi: 9000,
              isSelected: true,
            }
          );
        }

        setCandidates(list);
      } catch (err) {
        console.error("Error loading liabilities for refinance studio:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLiabilities();
  }, []);

  const toggleCandidate = (id: string) => {
    playClickSound();
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isSelected: !c.isSelected } : c))
    );
  };

  const handleAddCustomLiability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customBalance) return;

    playClickSound();
    const newCand: RefinanceCandidate = {
      id: "custom-" + Date.now(),
      name: customName,
      type: "custom",
      balance: parseFloat(customBalance) || 100000,
      rate: parseFloat(customRate) || 15.0,
      emi: parseFloat(customEmi) || 4000,
      isSelected: true,
    };

    setCandidates((prev) => [newCand, ...prev]);
    setCustomName("");
    setShowAddCustom(false);
    playSuccessSound();
  };

  // Calculations
  const selectedItems = candidates.filter((c) => c.isSelected);
  const totalBalanceToRefinance = selectedItems.reduce((sum, c) => sum + c.balance, 0);
  const currentMonthlyEmi = selectedItems.reduce((sum, c) => sum + c.emi, 0);

  // Weighted average rate
  const weightedRate = totalBalanceToRefinance > 0
    ? selectedItems.reduce((sum, c) => sum + c.balance * c.rate, 0) / totalBalanceToRefinance
    : 0;

  // New Refinanced EMI: P * r * (1+r)^n / ((1+r)^n - 1)
  const nMonths = tenureYears * 12;
  const newMonthlyRate = targetRatePct / 100 / 12;
  
  const calcEmi = (p: number, r: number, n: number) => {
    if (r === 0 || n === 0) return p / (n || 1);
    const factor = Math.pow(1 + r, n);
    return (p * r * factor) / (factor - 1);
  };

  const newEmi = totalBalanceToRefinance > 0 ? calcEmi(totalBalanceToRefinance, newMonthlyRate, nMonths) : 0;
  
  // Fee calculations
  const processingFee = totalBalanceToRefinance * (processingFeePct / 100);
  const preclosureFee = totalBalanceToRefinance * (preclosureFeePct / 100);
  const totalUpfrontFees = processingFee + preclosureFee;

  // Total old cost vs new cost
  const oldTotalCost = currentMonthlyEmi * nMonths;
  const newTotalCost = newEmi * nMonths + totalUpfrontFees;

  const monthlySavings = Math.max(0, currentMonthlyEmi - newEmi);
  const netLifetimeSavings = Math.max(0, oldTotalCost - newTotalCost);

  // Break-even period in months
  const breakEvenMonths = monthlySavings > 0 ? (totalUpfrontFees / monthlySavings).toFixed(1) : "N/A";

  const handleApplyBalanceTransfer = () => {
    playSuccessSound();
    setAppliedDeal(true);
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-5 rounded-2xl shadow-lg space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Balance to Consolidate
          </span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {formatCurrency(totalBalanceToRefinance)}
          </div>
          <span className="text-[11px] text-[var(--color-text-tertiary)] font-medium">
            {selectedItems.length} High-Interest Liabilities Selected
          </span>
        </div>

        <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-5 rounded-2xl shadow-lg space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Current Avg APR vs Target
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-500 line-through opacity-80">{weightedRate.toFixed(1)}%</span>
            <span className="text-2xl font-black text-emerald-500">→ {targetRatePct}%</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            {(weightedRate - targetRatePct).toFixed(1)}% APR Drop
          </span>
        </div>

        <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-5 rounded-2xl shadow-lg space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Monthly Cash Flow Savings
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(monthlySavings)} / mo
          </div>
          <span className="text-[11px] text-[var(--color-text-tertiary)] font-medium">
            EMI drops from {formatCurrency(currentMonthlyEmi)} to {formatCurrency(newEmi)}
          </span>
        </div>

        <div className="card bg-[var(--color-surface)] border border-emerald-500/40 p-5 rounded-2xl shadow-lg bg-gradient-to-br from-emerald-500/10 to-transparent space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Net Lifetime Interest Savings
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-300">
            {formatCurrency(netLifetimeSavings)}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            Break-even in {breakEvenMonths} months
          </span>
        </div>
      </div>

      {/* Main Studio Body: Liabilities Selection & Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Select Liabilities */}
        <div className="lg:col-span-1 card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-5 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
            <h3 className="font-extrabold text-base text-[var(--color-text-primary)]">
              1. Select Liabilities
            </h3>
            <button
              onClick={() => setShowAddCustom(!showAddCustom)}
              className="text-xs px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-xs"
            >
              {showAddCustom ? "Cancel" : "+ Add Debt"}
            </button>
          </div>

          {/* Add Custom Debt Form */}
          {showAddCustom && (
            <form onSubmit={handleAddCustomLiability} className="p-3.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-3 animate-in fade-in">
              <span className="text-xs font-bold text-[var(--color-text-primary)] block">Add Custom Bank / Credit Debt</span>
              <div>
                <input
                  type="text"
                  placeholder="Lender Name (e.g. Axis Bank Loan)"
                  className="w-full input text-xs p-2.5 rounded-lg h-9"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-[var(--color-text-tertiary)] block mb-0.5">Balance (₹)</label>
                  <input
                    type="number"
                    className="w-full input text-xs p-2 rounded-lg h-8"
                    value={customBalance}
                    onChange={(e) => setCustomBalance(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--color-text-tertiary)] block mb-0.5">APR (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full input text-xs p-2 rounded-lg h-8"
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--color-text-tertiary)] block mb-0.5">EMI (₹)</label>
                  <input
                    type="number"
                    className="w-full input text-xs p-2 rounded-lg h-8"
                    value={customEmi}
                    onChange={(e) => setCustomEmi(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xs"
              >
                Add to Refinance Calculator
              </button>
            </form>
          )}

          {loading ? (
            <div className="py-8 text-center text-xs text-[var(--color-text-tertiary)] font-mono animate-pulse">
              ⏳ Scanning portfolio liabilities...
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {candidates.map((c) => (
                <div
                  key={c.id}
                  onClick={() => toggleCandidate(c.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    c.isSelected
                      ? "bg-purple-500/10 border-purple-500/60 shadow-xs"
                      : "bg-[var(--color-surface-secondary)] border-[var(--color-border-light)] opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{c.type === "card" ? "💳" : c.type === "custom" ? "🏷️" : "🏦"}</span>
                        <span className="font-bold text-xs text-[var(--color-text-primary)]">{c.name}</span>
                      </div>
                      <div className="text-[11px] text-[var(--color-text-tertiary)] mt-1">
                        Balance: <strong className="text-[var(--color-text-primary)]">{formatCurrency(c.balance)}</strong>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={c.isSelected}
                      onChange={() => {}}
                      className="accent-purple-600 w-4 h-4 rounded mt-0.5"
                    />
                  </div>

                  <div className="mt-2 pt-2 border-t border-[var(--color-border-light)] flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-rose-500">{c.rate}% APR</span>
                    <span className="text-[var(--color-text-secondary)] font-medium">
                      EMI: {formatCurrency(c.emi)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 2 Columns: Sliders & Savings Breakdown */}
        <div className="lg:col-span-2 card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-6 rounded-2xl space-y-6 shadow-xl">
          <div className="border-b border-[var(--color-border-light)] pb-4">
            <h3 className="font-black text-lg text-[var(--color-text-primary)]">
              2. Refinancing Terms & Deal Simulator
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Adjust target interest rate, consolidation tenure, and processing fee assumptions to compute net savings.
            </p>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Target APR Slider */}
            <div className="space-y-2 p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
              <div className="flex justify-between font-bold">
                <span className="text-[var(--color-text-secondary)]">Refinanced Target Rate</span>
                <span className="text-purple-600 dark:text-purple-400 font-mono text-sm">{targetRatePct}% APR</span>
              </div>
              <input
                type="range"
                min="7.0"
                max="18.0"
                step="0.25"
                value={targetRatePct}
                onChange={(e) => setTargetRatePct(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--color-text-tertiary)] font-mono">
                <span>7.0% (Prime Bank)</span>
                <span>18.0%</span>
              </div>
            </div>

            {/* Tenure Slider */}
            <div className="space-y-2 p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
              <div className="flex justify-between font-bold">
                <span className="text-[var(--color-text-secondary)]">Consolidation Tenure</span>
                <span className="text-purple-600 dark:text-purple-400 font-mono text-sm">{tenureYears} Years ({tenureYears * 12} mo)</span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(parseInt(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--color-text-tertiary)] font-mono">
                <span>1 Year</span>
                <span>7 Years</span>
              </div>
            </div>

            {/* Processing Fee % */}
            <div className="space-y-2 p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
              <div className="flex justify-between font-bold">
                <span className="text-[var(--color-text-secondary)]">Processing Fee ({processingFeePct}%)</span>
                <span className="font-mono text-rose-500">{formatCurrency(processingFee)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="3.0"
                step="0.25"
                value={processingFeePct}
                onChange={(e) => setProcessingFeePct(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            {/* Pre-closure Penalty % */}
            <div className="space-y-2 p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
              <div className="flex justify-between font-bold">
                <span className="text-[var(--color-text-secondary)]">Pre-closure Fee ({preclosureFeePct}%)</span>
                <span className="font-mono text-rose-500">{formatCurrency(preclosureFee)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="4.0"
                step="0.25"
                value={preclosureFeePct}
                onChange={(e) => setPreclosureFeePct(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Detailed Financial Comparison Table */}
          <div className="p-4 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border-light)] space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Detailed Refinancing Financial Comparison
            </h4>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-rose-500/30 space-y-1">
                <span className="text-[10px] text-rose-500 font-bold uppercase">Current Unconsolidated</span>
                <div className="text-sm font-bold text-[var(--color-text-primary)]">
                  {formatCurrency(currentMonthlyEmi)} / mo
                </div>
                <div className="text-[11px] text-[var(--color-text-tertiary)]">
                  Total Repayment Cost: {formatCurrency(oldTotalCost)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-emerald-500/40 space-y-1">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Refinanced Consolidated</span>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(newEmi)} / mo
                </div>
                <div className="text-[11px] text-[var(--color-text-tertiary)]">
                  Total Cost (incl. fees): {formatCurrency(newTotalCost)}
                </div>
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div>
            {appliedDeal ? (
              <div className="p-5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span>🎉 Refinancing Request & P2P Market Match Initiated!</span>
                </div>
                <p className="text-xs font-normal leading-relaxed">
                  Your balance transfer consolidation request of <strong>{formatCurrency(totalBalanceToRefinance)}</strong> at <strong>{targetRatePct}% APR</strong> has been posted to DebtProof P2P market pools and verified lenders.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push("/dashboard/p2p-market")}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all shadow-xs"
                  >
                    View P2P Market Request
                  </button>
                  <button
                    onClick={() => setAppliedDeal(false)}
                    className="px-4 py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border-light)] font-bold text-xs hover:bg-[var(--color-surface-tertiary)] transition-all"
                  >
                    Modify Calculation
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleApplyBalanceTransfer}
                disabled={totalBalanceToRefinance === 0}
                className={`w-full py-4 px-6 rounded-xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                  totalBalanceToRefinance === 0
                    ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/25 active:scale-[0.99]"
                }`}
              >
                <span>🔄 Initiate Balance Transfer & Save {formatCurrency(netLifetimeSavings)}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RefinanceSavingsStudio;

