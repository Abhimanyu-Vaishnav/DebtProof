/**
 * DebtProof — Budget Planner
 * Monthly income vs expenses vs EMI vs SIP unified budget with health score.
 */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { loansService } from "@/services/loans.service";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { DashboardData } from "@/types";

// ── Storage Key ──────────────────────────────────────────────────
const STORAGE_KEY = "debtproof-budget-v1";

interface ExpenseCategory {
  id: string;
  label: string;
  icon: string;
  amount: number;
  color: string;
}

interface BudgetData {
  primaryIncome: number;
  sideIncome: number;
  expenses: ExpenseCategory[];
  extraSavings: number;
}

const DEFAULT_EXPENSES: ExpenseCategory[] = [
  { id: "rent", label: "Rent / Housing", icon: "🏠", amount: 0, color: "#3b82f6" },
  { id: "groceries", label: "Groceries & Food", icon: "🛒", amount: 0, color: "#10b981" },
  { id: "utilities", label: "Utilities & Bills", icon: "⚡", amount: 0, color: "#f59e0b" },
  { id: "transport", label: "Transport & Fuel", icon: "🚗", amount: 0, color: "#8b5cf6" },
  { id: "health", label: "Health & Medical", icon: "💊", amount: 0, color: "#ef4444" },
  { id: "entertainment", label: "Entertainment", icon: "🎬", amount: 0, color: "#ec4899" },
  { id: "education", label: "Education & Fees", icon: "📚", amount: 0, color: "#06b6d4" },
  { id: "misc", label: "Miscellaneous", icon: "📦", amount: 0, color: "#6b7280" },
];

const DEFAULT_BUDGET: BudgetData = {
  primaryIncome: 0,
  sideIncome: 0,
  expenses: DEFAULT_EXPENSES,
  extraSavings: 0,
};

// ── Score Band ───────────────────────────────────────────────────
function scoreBand(score: number) {
  if (score >= 80) return { label: "Excellent 🎉", color: "#10b981", bg: "bg-emerald-500/15 border-emerald-500/30" };
  if (score >= 60) return { label: "Good 👍", color: "#3b82f6", bg: "bg-blue-500/15 border-blue-500/30" };
  if (score >= 40) return { label: "Fair ⚡", color: "#f59e0b", bg: "bg-amber-500/15 border-amber-500/30" };
  if (score >= 20) return { label: "Tight 😬", color: "#f97316", bg: "bg-orange-500/15 border-orange-500/30" };
  return { label: "Critical ⚠️", color: "#ef4444", bg: "bg-rose-500/15 border-rose-500/30" };
}

// ── Number Input ─────────────────────────────────────────────────
function AmountInput({ value, onChange, placeholder }: { value: number; onChange: (v: number) => void; placeholder?: string }) {
  return (
    <input
      type="number" min="0" value={value || ""} onChange={e => onChange(parseFloat(e.target.value) || 0)}
      placeholder={placeholder || "0"}
      className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-sm font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-tertiary)]"
    />
  );
}

// ── Main Budget Planner ──────────────────────────────────────────
export function BudgetClient() {
  const [budget, setBudget] = useState<BudgetData>(DEFAULT_BUDGET);
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "income" | "expenses" | "commitments">("overview");
  const { format } = useCurrency();

  // Load saved budget + dashboard data
  useEffect(() => {
    loansService.getDashboard().then(setDashData).finally(() => setLoading(false));
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as BudgetData;
        // Merge with defaults to handle new categories
        setBudget({
          ...DEFAULT_BUDGET,
          ...parsed,
          expenses: DEFAULT_EXPENSES.map(def => {
            const found = parsed.expenses?.find(e => e.id === def.id);
            return found ? { ...def, amount: found.amount } : def;
          }),
        });
      }
    } catch { /* ignore */ }
  }, []);

  const saveBudget = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budget));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [budget]);

  const resetBudget = () => {
    setBudget(DEFAULT_BUDGET);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Derived values
  const totalIncome = budget.primaryIncome + budget.sideIncome;
  const totalExpenses = budget.expenses.reduce((s, e) => s + e.amount, 0);
  const totalEMI = dashData?.upcoming_emi_amount || 0;
  // Monthly EMI from dashboard (sum of all active loans)
  const monthlyEMI = dashData ? (dashData.total_outstanding > 0
    ? Math.round(dashData.upcoming_emi_amount || dashData.monthly_interest_burn * 3)
    : 0) : 0;
  const totalCommitments = monthlyEMI + budget.extraSavings;
  const totalSpend = totalExpenses + totalCommitments;
  const remaining = totalIncome - totalSpend;
  const savingsRate = totalIncome > 0 ? Math.max(0, (remaining / totalIncome) * 100) : 0;
  const debtToIncome = totalIncome > 0 ? (monthlyEMI / totalIncome) * 100 : 0;

  // Budget Health Score (0–100)
  const healthScore = Math.min(100, Math.max(0,
    (savingsRate >= 20 ? 40 : savingsRate * 2) +
    (debtToIncome <= 30 ? 30 : Math.max(0, 30 - (debtToIncome - 30) * 1.5)) +
    (remaining >= 0 ? 30 : 0)
  ));
  const band = scoreBand(healthScore);

  const TABS = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "income", label: "Income", icon: "💵" },
    { id: "expenses", label: "Expenses", icon: "🛒" },
    { id: "commitments", label: "EMI & Savings", icon: "🏦" },
  ] as const;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[var(--color-text-secondary)]">Loading your budget...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">

      {/* Health Score Banner */}
      <div className={`card p-5 border-2 ${band.bg} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          {/* Score Ring */}
          <div className="relative shrink-0">
            <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
              <circle cx="40" cy="40" r="32" fill="none" stroke="var(--color-surface-tertiary)" strokeWidth="8" />
              <circle cx="40" cy="40" r="32" fill="none" stroke={band.color} strokeWidth="8"
                strokeDasharray={`${(healthScore / 100) * (2 * Math.PI * 32)} ${2 * Math.PI * 32}`}
                strokeLinecap="round" className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-[var(--color-text-primary)]">{Math.round(healthScore)}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Budget Health Score</p>
            <p className="text-xl font-black text-[var(--color-text-primary)] mt-0.5">{band.label}</p>
            <p className="text-xs font-medium text-[var(--color-text-secondary)] mt-1">
              {healthScore >= 60 ? "Your finances look healthy! Keep it up." :
               healthScore >= 40 ? "Some improvements recommended. See tips below." :
               "Consider reducing EMI commitments or increasing income."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={saveBudget}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${saved ? "bg-emerald-500 text-white" : "bg-[var(--color-primary)] text-white hover:opacity-90"}`}>
            {saved ? "✓ Saved!" : "💾 Save Budget"}
          </button>
          <button onClick={resetBudget}
            className="px-3 py-2 rounded-xl text-sm font-bold bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer">
            Reset
          </button>
        </div>
      </div>

      {/* Quick Numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Monthly Income", value: format(totalIncome), icon: "💵", color: "text-emerald-600 dark:text-emerald-400", sub: "Salary + side income" },
          { label: "Fixed Commitments", value: format(totalCommitments), icon: "🏦", color: "text-blue-600 dark:text-blue-400", sub: `EMI + savings` },
          { label: "Variable Expenses", value: format(totalExpenses), icon: "🛒", color: "text-amber-600 dark:text-amber-400", sub: "Day-to-day spending" },
          { label: "Remaining Balance", value: format(remaining), icon: remaining >= 0 ? "✅" : "⚠️", color: remaining >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400", sub: remaining >= 0 ? `${savingsRate.toFixed(1)}% savings rate` : "Budget deficit!" },
        ].map(s => (
          <div key={s.label} className="card p-4 border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">{s.label}</span>
              <span className="text-base">{s.icon}</span>
            </div>
            <p className={`text-lg font-black ${s.color} leading-none`}>{s.value}</p>
            <p className="text-[10px] font-medium text-[var(--color-text-secondary)] mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Visual Budget Bar */}
      {totalIncome > 0 && (
        <div className="card p-5 border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-primary)]">Monthly Budget Allocation</p>
            <p className="text-xs font-bold text-[var(--color-text-secondary)]">Total: {format(totalIncome)}</p>
          </div>
          {/* Stacked bar */}
          <div className="h-5 w-full rounded-full overflow-hidden flex bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] mb-3">
            {[
              { pct: Math.min((monthlyEMI / totalIncome) * 100, 100), color: "#3b82f6", label: "EMI" },
              { pct: Math.min((totalExpenses / totalIncome) * 100, 100 - (monthlyEMI / totalIncome) * 100), color: "#f59e0b", label: "Expenses" },
              { pct: Math.min((budget.extraSavings / totalIncome) * 100, 100), color: "#10b981", label: "Savings" },
            ].map(seg => (
              <div key={seg.label} className="h-full transition-all duration-700" style={{ width: `${Math.max(0, seg.pct)}%`, backgroundColor: seg.color }} />
            ))}
            {remaining > 0 && (
              <div className="h-full flex-1 bg-emerald-500/20" />
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-[11px]">
            {[
              { color: "#3b82f6", label: "EMI", value: format(monthlyEMI), pct: debtToIncome },
              { color: "#f59e0b", label: "Expenses", value: format(totalExpenses), pct: totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0 },
              { color: "#10b981", label: "Savings Target", value: format(budget.extraSavings), pct: totalIncome > 0 ? (budget.extraSavings / totalIncome) * 100 : 0 },
              { color: remaining >= 0 ? "#22c55e" : "#ef4444", label: "Free Cash", value: format(remaining), pct: totalIncome > 0 ? (remaining / totalIncome) * 100 : 0 },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="font-bold text-[var(--color-text-secondary)]">{s.label}:</span>
                <span className="font-black text-[var(--color-text-primary)]">{s.value}</span>
                <span className="text-[var(--color-text-secondary)]">({s.pct.toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id ? "bg-[var(--color-primary)] text-white shadow-sm" : "bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-tertiary)]"
            }`}>
            <span>{tab.icon}</span><span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "income" && (
        <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-5">
          <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-primary)]">💵 Monthly Income Sources</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--color-text-secondary)] mb-1.5 block">Primary Income (Salary / Business)</label>
              <AmountInput value={budget.primaryIncome} onChange={v => setBudget(b => ({ ...b, primaryIncome: v }))} placeholder="e.g. 80000" />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--color-text-secondary)] mb-1.5 block">Secondary / Side Income</label>
              <AmountInput value={budget.sideIncome} onChange={v => setBudget(b => ({ ...b, sideIncome: v }))} placeholder="e.g. 15000" />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Total Monthly Income</p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{format(totalIncome)}</p>
          </div>
        </div>
      )}

      {activeTab === "expenses" && (
        <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
          <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-primary)]">🛒 Monthly Variable Expenses</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {budget.expenses.map(exp => (
              <div key={exp.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: exp.color + "20" }}>
                  {exp.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)] block">{exp.label}</label>
                  <input type="number" min="0" value={exp.amount || ""}
                    onChange={e => setBudget(b => ({ ...b, expenses: b.expenses.map(ex => ex.id === exp.id ? { ...ex, amount: parseFloat(e.target.value) || 0 } : ex) }))}
                    placeholder="0"
                    className="w-full mt-1 px-2 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-black text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">Total Variable Expenses</p>
            <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{format(totalExpenses)}</p>
          </div>
        </div>
      )}

      {activeTab === "commitments" && (
        <div className="space-y-4">
          {/* EMI (auto from dashboard) */}
          <div className="card p-5 border border-blue-500/30 bg-[var(--color-surface)]">
            <p className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4">🏦 Fixed EMI Commitments (Auto-Calculated)</p>
            {dashData && dashData.active_loans > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]">
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">Active Loans</p>
                  <p className="text-sm font-black text-blue-600 dark:text-blue-400">{dashData.active_loans} loans</p>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]">
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">Total Outstanding</p>
                  <p className="text-sm font-black text-rose-600 dark:text-rose-400">{format(dashData.total_outstanding)}</p>
                </div>
                <div className="flex justify-between items-center py-2">
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">Next EMI Due</p>
                  <p className="text-sm font-black text-blue-600 dark:text-blue-400">{format(dashData.upcoming_emi_amount)}</p>
                </div>
                <div className="mt-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">Debt-to-Income Ratio</p>
                  <p className="text-lg font-black text-blue-700 dark:text-blue-400 mt-0.5">{debtToIncome.toFixed(1)}%</p>
                  <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
                    {debtToIncome <= 30 ? "✅ Healthy (recommended: below 30%)" : debtToIncome <= 50 ? "⚠️ Moderate — consider prepayment" : "❌ High — seek refinancing options"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-secondary)]">No active loans found. Add loans in the Loans section.</p>
            )}
          </div>

          {/* Extra savings target */}
          <div className="card p-5 border border-[var(--color-border)] bg-[var(--color-surface)]">
            <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-primary)] mb-4">🎯 Monthly Savings Target</p>
            <div>
              <label className="text-xs font-bold text-[var(--color-text-secondary)] mb-1.5 block">How much do you want to save every month?</label>
              <AmountInput value={budget.extraSavings} onChange={v => setBudget(b => ({ ...b, extraSavings: v }))} placeholder="e.g. 10000" />
              {budget.extraSavings > 0 && totalIncome > 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1.5">
                  = {((budget.extraSavings / totalIncome) * 100).toFixed(1)}% of income dedicated to savings
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Breakdown table */}
          <div className="card p-5 border border-[var(--color-border)] bg-[var(--color-surface)]">
            <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-primary)] mb-4">📋 Budget Breakdown</p>
            <div className="space-y-1">
              {/* Income */}
              <div className="flex items-center justify-between py-2.5 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-sm font-bold text-[var(--color-text-primary)]">Total Income</span>
                </div>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">+{format(totalIncome)}</span>
              </div>

              {/* EMI */}
              <div className="flex items-center justify-between py-2.5 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">Loan EMI Payments</span>
                </div>
                <span className="text-sm font-black text-blue-600 dark:text-blue-400">-{format(monthlyEMI)}</span>
              </div>

              {/* Expenses */}
              {budget.expenses.filter(e => e.amount > 0).map(exp => (
                <div key={exp.id} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{exp.icon}</span>
                    <span className="text-xs font-medium text-[var(--color-text-secondary)]">{exp.label}</span>
                  </div>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">-{format(exp.amount)}</span>
                </div>
              ))}

              {/* Savings */}
              {budget.extraSavings > 0 && (
                <div className="flex items-center justify-between py-2.5 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500/50 inline-block" />
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">Savings Target</span>
                  </div>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">-{format(budget.extraSavings)}</span>
                </div>
              )}

              {/* Net */}
              <div className={`flex items-center justify-between py-3 rounded-xl px-3 mt-2 ${remaining >= 0 ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-rose-500/10 border border-rose-500/20"}`}>
                <span className="text-sm font-black text-[var(--color-text-primary)]">💰 Free Cash (Remaining)</span>
                <span className={`text-base font-black ${remaining >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {remaining >= 0 ? "+" : ""}{format(remaining)}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Tips */}
          <div className="card p-5 border border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
            <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-primary)] mb-3">💡 Personalized Tips</p>
            <div className="space-y-2.5">
              {debtToIncome > 40 && (
                <div className="flex gap-2 text-xs">
                  <span className="text-rose-500 font-black shrink-0">⚠️</span>
                  <p className="text-[var(--color-text-secondary)] font-medium">Your EMI-to-income ratio is <strong className="text-rose-500">{debtToIncome.toFixed(0)}%</strong>. Aim for below 30%. Consider prepaying the highest-interest loan first.</p>
                </div>
              )}
              {savingsRate < 20 && totalIncome > 0 && (
                <div className="flex gap-2 text-xs">
                  <span className="text-amber-500 font-black shrink-0">💡</span>
                  <p className="text-[var(--color-text-secondary)] font-medium">You're saving <strong className="text-amber-500">{savingsRate.toFixed(0)}%</strong> of income. Financial experts recommend saving at least 20%.</p>
                </div>
              )}
              {savingsRate >= 20 && (
                <div className="flex gap-2 text-xs">
                  <span className="text-emerald-500 font-black shrink-0">🎉</span>
                  <p className="text-[var(--color-text-secondary)] font-medium">Excellent! You're saving <strong className="text-emerald-500">{savingsRate.toFixed(0)}%</strong> of income. That's above the recommended 20%!</p>
                </div>
              )}
              {remaining < 0 && (
                <div className="flex gap-2 text-xs">
                  <span className="text-rose-500 font-black shrink-0">❌</span>
                  <p className="text-[var(--color-text-secondary)] font-medium">Your expenses exceed income by <strong className="text-rose-500">{format(Math.abs(remaining))}</strong>. Review variable expenses or increase income.</p>
                </div>
              )}
              {totalIncome === 0 && (
                <div className="flex gap-2 text-xs">
                  <span className="text-blue-500 font-black shrink-0">👋</span>
                  <p className="text-[var(--color-text-secondary)] font-medium">Start by entering your monthly income in the <strong>Income</strong> tab above.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
