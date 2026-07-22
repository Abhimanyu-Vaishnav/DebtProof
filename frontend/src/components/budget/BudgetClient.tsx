/**
 * DebtProof — Budget Planner (Redesigned)
 * Unified income synchronization with Dashboard (debtproof_income_streams).
 * Premium interactive UI with real-time budget intelligence, expense breakdown, and health analysis.
 */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { loansService } from "@/services/loans.service";
import { assetsService } from "@/services/assets.service";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { DashboardData } from "@/types";

// ── Types & Storage Keys ──────────────────────────────────────────
const BUDGET_STORAGE_KEY = "debtproof-budget-v1";
const INCOME_STORAGE_KEY = "debtproof_income_streams";

export interface IncomeStream {
  id: string;
  sourceName: string;
  category: "salary" | "rental" | "business" | "freelance" | "dividends" | "other";
  categoryLabel: string;
  monthlyAmount: number;
  isRecurring: boolean;
}

const DEFAULT_INCOMES: IncomeStream[] = [
  { id: "inc-1", sourceName: "Primary Salary", category: "salary", categoryLabel: "Salary", monthlyAmount: 95000, isRecurring: true },
  { id: "inc-2", sourceName: "Commercial Rental Income", category: "rental", categoryLabel: "Rent", monthlyAmount: 18000, isRecurring: true },
  { id: "inc-3", sourceName: "Freelance Consulting", category: "freelance", categoryLabel: "Freelance", monthlyAmount: 15000, isRecurring: false },
];

interface ExpenseCategory {
  id: string;
  label: string;
  icon: string;
  amount: number;
  color: string;
}

interface BudgetData {
  expenses: ExpenseCategory[];
  extraSavings: number;
}

const DEFAULT_EXPENSES: ExpenseCategory[] = [
  { id: "rent", label: "Rent / Housing", icon: "🏠", amount: 22000, color: "#3b82f6" },
  { id: "groceries", label: "Groceries & Food", icon: "🛒", amount: 12000, color: "#10b981" },
  { id: "utilities", label: "Utilities & Bills", icon: "⚡", amount: 4500, color: "#f59e0b" },
  { id: "transport", label: "Transport & Fuel", icon: "🚗", amount: 6000, color: "#8b5cf6" },
  { id: "health", label: "Health & Medical", icon: "💊", amount: 3000, color: "#ef4444" },
  { id: "entertainment", label: "Entertainment & Leisure", icon: "🎬", amount: 5000, color: "#ec4899" },
  { id: "education", label: "Education & Skills", icon: "📚", amount: 4000, color: "#06b6d4" },
  { id: "misc", label: "Miscellaneous", icon: "📦", amount: 3500, color: "#6b7280" },
];

const CATEGORY_MAP: Record<IncomeStream["category"], { label: string; icon: string }> = {
  salary: { label: "Salary", icon: "💼" },
  rental: { label: "Rental", icon: "🏠" },
  business: { label: "Business", icon: "🏢" },
  freelance: { label: "Freelance", icon: "💻" },
  dividends: { label: "Dividends / Returns", icon: "📈" },
  other: { label: "Other Income", icon: "🪙" },
};

// ── Score Band Calculation ───────────────────────────────────────
function getScoreBand(score: number) {
  if (score >= 80) return { label: "Excellent Wealth Velocity", emoji: "🏆", color: "#10b981", bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-700 dark:text-emerald-400" };
  if (score >= 65) return { label: "Strong & Healthy", emoji: "💪", color: "#3b82f6", bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-700 dark:text-blue-400" };
  if (score >= 45) return { label: "Balanced / Caution", emoji: "⚡", color: "#f59e0b", bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-700 dark:text-amber-400" };
  if (score >= 25) return { label: "Tight Cashflow", emoji: "😬", color: "#f97316", bg: "bg-orange-500/10 border-orange-500/30", text: "text-orange-700 dark:text-orange-400" };
  return { label: "High Risk Deficit", emoji: "🚨", color: "#ef4444", bg: "bg-rose-500/10 border-rose-500/30", text: "text-rose-700 dark:text-rose-400" };
}

export function BudgetClient() {
  const { format } = useCurrency();
  const [incomes, setIncomes] = useState<IncomeStream[]>([]);
  const [budget, setBudget] = useState<BudgetData>({ expenses: DEFAULT_EXPENSES, extraSavings: 15000 });
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "income" | "expenses" | "commitments">("overview");

  // Income Modal State (Same functionality as Dashboard IncomeTrackerWidget)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IncomeStream | null>(null);
  const [formData, setFormData] = useState({
    sourceName: "",
    category: "salary" as IncomeStream["category"],
    monthlyAmount: "",
  });

  // Load Incomes (Synchronized with Dashboard) and Budget data
  const loadIncomesFromStorage = useCallback(() => {
    const savedIncomes = localStorage.getItem(INCOME_STORAGE_KEY);
    if (savedIncomes) {
      try {
        setIncomes(JSON.parse(savedIncomes));
        return;
      } catch { /* fallback */ }
    }
    setIncomes(DEFAULT_INCOMES);
    localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(DEFAULT_INCOMES));
  }, []);

  useEffect(() => {
    loadIncomesFromStorage();

    // Listen to changes across tabs or dashboard
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === INCOME_STORAGE_KEY) {
        loadIncomesFromStorage();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Fetch dashboard data for EMIs
    loansService.getDashboard().then(setDashData).finally(() => setLoading(false));

    // Load Budget expenses
    const savedBudget = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (savedBudget) {
      try {
        const parsed = JSON.parse(savedBudget) as BudgetData;
        setBudget({
          extraSavings: parsed.extraSavings ?? 15000,
          expenses: DEFAULT_EXPENSES.map(def => {
            const found = parsed.expenses?.find(e => e.id === def.id);
            return found ? { ...def, amount: found.amount } : def;
          }),
        });
      } catch { /* fallback */ }
    }

    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadIncomesFromStorage]);

  // Income mutation helpers
  const saveIncomes = (items: IncomeStream[]) => {
    setIncomes(items);
    localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("debtproof_income_updated"));
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ sourceName: "", category: "salary", monthlyAmount: "" });
    setIsAddModalOpen(true);
  };

  const openEditModal = (inc: IncomeStream) => {
    setEditingItem(inc);
    setFormData({
      sourceName: inc.sourceName,
      category: inc.category,
      monthlyAmount: inc.monthlyAmount.toString(),
    });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sourceName || !formData.monthlyAmount) return;

    const amount = parseFloat(formData.monthlyAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (editingItem) {
      const updated = incomes.map((i) =>
        i.id === editingItem.id
          ? {
              ...i,
              sourceName: formData.sourceName,
              category: formData.category,
              categoryLabel: CATEGORY_MAP[formData.category].label,
              monthlyAmount: amount,
            }
          : i
      );
      saveIncomes(updated);
    } else {
      const item: IncomeStream = {
        id: `inc-${Date.now()}`,
        sourceName: formData.sourceName,
        category: formData.category,
        categoryLabel: CATEGORY_MAP[formData.category].label,
        monthlyAmount: amount,
        isRecurring: true,
      };
      saveIncomes([item, ...incomes]);
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteIncome = (id: string) => {
    if (!confirm("Are you sure you want to delete this income stream?")) return;
    saveIncomes(incomes.filter((i) => i.id !== id));
  };

  const saveBudget = () => {
    localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budget));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Calculations
  const totalIncome = incomes.reduce((s, i) => s + i.monthlyAmount, 0);
  const totalExpenses = budget.expenses.reduce((s, e) => s + e.amount, 0);
  
  // Real active loan monthly EMI estimation
  const monthlyEMI = dashData && dashData.total_outstanding > 0
    ? Math.round(dashData.upcoming_emi_amount || dashData.monthly_interest_burn * 3 || 68800)
    : 0;

  const totalFixedOutflow = monthlyEMI + budget.extraSavings;
  const totalOutflow = totalExpenses + totalFixedOutflow;
  const remainingCash = totalIncome - totalOutflow;

  const savingsRate = totalIncome > 0 ? Math.max(0, (remainingCash / totalIncome) * 100) : 0;
  const debtToIncome = totalIncome > 0 ? (monthlyEMI / totalIncome) * 100 : 0;
  const expenseToIncome = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  // Health score algorithm (0 - 100)
  const healthScore = Math.min(100, Math.max(0,
    (savingsRate >= 20 ? 40 : savingsRate * 2) +
    (debtToIncome <= 30 ? 35 : Math.max(0, 35 - (debtToIncome - 30) * 1.4)) +
    (remainingCash >= 0 ? 25 : 0)
  ));

  const scoreInfo = getScoreBand(healthScore);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-10 h-10 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Loading Intelligent Budgeting engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">

      {/* ── TOP HERO SCORE BANNER ─────────────────────────────── */}
      <div className={`card p-6 border-2 ${scoreInfo.bg} transition-all duration-300 relative overflow-hidden`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Circular Gauge */}
            <div className="relative shrink-0">
              <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
                <circle cx="45" cy="45" r="36" fill="none" stroke="var(--color-surface-tertiary)" strokeWidth="9" />
                <circle
                  cx="45" cy="45" r="36" fill="none" stroke={scoreInfo.color} strokeWidth="9"
                  strokeDasharray={`${(healthScore / 100) * (2 * Math.PI * 36)} ${2 * Math.PI * 36}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-[var(--color-text-primary)]">{Math.round(healthScore)}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Score</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{scoreInfo.emoji}</span>
                <span className={`text-base font-black uppercase tracking-wide ${scoreInfo.text}`}>
                  {scoreInfo.label}
                </span>
              </div>
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mt-1 max-w-xl leading-relaxed">
                {totalIncome === 0 ? "Add your monthly income streams to activate financial analysis and smart recommendations." :
                 remainingCash < 0 ? `Alert: Monthly expenditure exceeds income by ${format(Math.abs(remainingCash))}. Review expenses immediately.` :
                 `You have ${format(remainingCash)} surplus remaining. DTI ratio is ${debtToIncome.toFixed(1)}% and Savings Rate is ${savingsRate.toFixed(1)}%.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end lg:self-center">
            <button
              onClick={openAddModal}
              className="btn btn-primary btn-sm font-black text-xs px-4 py-2 flex items-center gap-1.5 shadow-md"
            >
              <span>+</span> Add Income
            </button>
            <button
              onClick={saveBudget}
              className={`btn btn-sm font-black text-xs px-4 py-2 transition-all ${
                saved ? "bg-emerald-600 text-white" : "btn-secondary"
              }`}
            >
              {saved ? "✓ Saved" : "💾 Save Plan"}
            </button>
          </div>
        </div>
      </div>

      {/* ── KEY METRICS CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4 border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Total Monthly Income</span>
            <span className="text-base">💼</span>
          </div>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{format(totalIncome)}</p>
          <div className="flex items-center justify-between mt-2 text-[10px] text-[var(--color-text-secondary)] font-medium">
            <span>{incomes.length} Income stream(s)</span>
            <button onClick={() => setActiveTab("income")} className="text-[var(--color-primary-light)] font-bold hover:underline">Manage</button>
          </div>
        </div>

        <div className="card p-4 border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Active Loan EMIs</span>
            <span className="text-base">🏦</span>
          </div>
          <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{format(monthlyEMI)}</p>
          <div className="flex items-center justify-between mt-2 text-[10px] text-[var(--color-text-secondary)] font-medium">
            <span>DTI: {debtToIncome.toFixed(1)}%</span>
            <span className={debtToIncome <= 35 ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
              {debtToIncome <= 35 ? "Safe" : "High Debt"}
            </span>
          </div>
        </div>

        <div className="card p-4 border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Living Expenses</span>
            <span className="text-base">🛒</span>
          </div>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{format(totalExpenses)}</p>
          <div className="flex items-center justify-between mt-2 text-[10px] text-[var(--color-text-secondary)] font-medium">
            <span>{expenseToIncome.toFixed(1)}% of income</span>
            <button onClick={() => setActiveTab("expenses")} className="text-[var(--color-primary-light)] font-bold hover:underline">Edit</button>
          </div>
        </div>

        <div className="card p-4 border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Net Surplus / Deficit</span>
            <span className="text-base">{remainingCash >= 0 ? "💰" : "⚠️"}</span>
          </div>
          <p className={`text-xl font-black mt-1 ${remainingCash >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {remainingCash >= 0 ? "+" : ""}{format(remainingCash)}
          </p>
          <div className="flex items-center justify-between mt-2 text-[10px] text-[var(--color-text-secondary)] font-medium">
            <span>Savings Rate</span>
            <span className="font-black text-[var(--color-text-primary)]">{savingsRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* ── VISUAL ALLOCATION BAR ─────────────────────────────── */}
      {totalIncome > 0 && (
        <div className="card p-5 border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-primary)]">Cash Flow Allocation Breakdown</span>
            <span className="text-xs font-bold text-[var(--color-text-secondary)]">Income: {format(totalIncome)}</span>
          </div>

          <div className="h-4 w-full rounded-full overflow-hidden flex bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] mb-3">
            <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${Math.min(100, (monthlyEMI / totalIncome) * 100)}%` }} title="EMIs" />
            <div className="h-full bg-amber-500 transition-all duration-700" style={{ width: `${Math.min(100 - (monthlyEMI / totalIncome) * 100, (totalExpenses / totalIncome) * 100)}%` }} title="Expenses" />
            <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${Math.min(100, (budget.extraSavings / totalIncome) * 100)}%` }} title="Savings Target" />
            {remainingCash > 0 && (
              <div className="h-full flex-1 bg-emerald-400/20" title="Unallocated Cash" />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-medium text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> EMIs: <strong>{format(monthlyEMI)}</strong> ({debtToIncome.toFixed(1)}%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Expenses: <strong>{format(totalExpenses)}</strong> ({expenseToIncome.toFixed(1)}%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Target Savings: <strong>{format(budget.extraSavings)}</strong></span>
            <span className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full inline-block ${remainingCash >= 0 ? "bg-emerald-400" : "bg-rose-500"}`} /> Free Surplus: <strong className={remainingCash < 0 ? "text-rose-500" : ""}>{format(remainingCash)}</strong></span>
          </div>
        </div>
      )}

      {/* ── NAVIGATION TABS ───────────────────────────────────── */}
      <div className="flex border-b border-[var(--color-border)] gap-6 overflow-x-auto scrollbar-none">
        {[
          { id: "overview", label: "Budget Overview", icon: "📊" },
          { id: "income", label: `Income Streams (${incomes.length})`, icon: "💼" },
          { id: "expenses", label: "Living Expenses", icon: "🛒" },
          { id: "commitments", label: "EMIs & Savings Target", icon: "🏦" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`pb-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "border-[var(--color-primary)] text-[var(--color-primary-light)]"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: OVERVIEW ───────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Summary Breakdown Table */}
          <div className="lg:col-span-2 card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-sm font-black text-[var(--color-text-primary)]">Monthly Cash Flow Statement</h3>
              <span className="text-xs font-bold text-emerald-500">Live Synchronized</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Total Monthly Income</span>
                <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">+{format(totalIncome)}</span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--color-text-primary)]">Fixed Debt Obligations (EMIs)</span>
                  <span className="font-black text-blue-600 dark:text-blue-400">-{format(monthlyEMI)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--color-text-primary)]">Living Expenses</span>
                  <span className="font-black text-amber-600 dark:text-amber-400">-{format(totalExpenses)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--color-text-primary)]">Target Monthly Investments</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">-{format(budget.extraSavings)}</span>
                </div>
              </div>

              <div className={`flex items-center justify-between p-3.5 rounded-xl border ${remainingCash >= 0 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"}`}>
                <span className="text-xs font-black text-[var(--color-text-primary)]">Available Unallocated Surplus</span>
                <span className={`text-base font-black ${remainingCash >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {remainingCash >= 0 ? "+" : ""}{format(remainingCash)}
                </span>
              </div>
            </div>

            {/* Smart Action Guidance */}
            <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] space-y-2 mt-4">
              <p className="text-[11px] font-black uppercase tracking-wider text-[var(--color-text-primary)]">💡 Smart Financial Advice</p>
              {debtToIncome > 40 && (
                <p className="text-xs text-rose-500 font-medium">⚠️ High EMI strain: Over 40% of income is going to loan payments. Consider prepaying loans or refinancing.</p>
              )}
              {savingsRate >= 20 && (
                <p className="text-xs text-emerald-500 font-medium">✨ Great job! Your savings rate of {savingsRate.toFixed(1)}% meets optimal wealth-building guidelines.</p>
              )}
              {remainingCash > 0 && (
                <p className="text-xs text-[var(--color-text-secondary)] font-medium">You have {format(remainingCash)} extra cash. Deploy this into SIPs or extra EMI prepayments to accelerate debt freedom!</p>
              )}
            </div>
          </div>

          {/* Quick Income Summary Sidebar */}
          <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider">Income Streams Summary</h3>
              <button onClick={() => setActiveTab("income")} className="text-[11px] font-bold text-[var(--color-primary-light)] hover:underline">Manage All</button>
            </div>

            <div className="space-y-2.5">
              {incomes.map(inc => (
                <div key={inc.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs">
                  <div>
                    <p className="font-bold text-[var(--color-text-primary)]">{inc.sourceName}</p>
                    <p className="text-[10px] text-[var(--color-text-secondary)]">{inc.categoryLabel}</p>
                  </div>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">{format(inc.monthlyAmount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: INCOME STREAMS (Same design as Dashboard Income Tracker) ───────────────────── */}
      {activeTab === "income" && (
        <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
            <div>
              <h3 className="text-base font-black text-[var(--color-text-primary)]">Income Streams (Synchronized with Dashboard)</h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Changes made here automatically update your Dashboard and overall DebtProof analytics.</p>
            </div>
            <button
              onClick={openAddModal}
              className="btn btn-primary btn-sm font-black text-xs px-4 py-2 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>+</span> Add Income Source
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomes.map((inc) => (
              <div
                key={inc.id}
                className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] flex flex-col justify-between space-y-3 group hover:border-[var(--color-primary-light)] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                      {CATEGORY_MAP[inc.category]?.icon || "💼"}
                    </span>
                    <div>
                      <p className="text-sm font-black text-[var(--color-text-primary)]">{inc.sourceName}</p>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary-light)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-md inline-block mt-0.5">
                        {inc.categoryLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--color-border-light)] flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] block">Monthly Amount</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{format(inc.monthlyAmount)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(inc)}
                      className="p-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary-light)] hover:bg-[var(--color-surface)] rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteIncome(inc.id)}
                      className="p-1.5 text-xs text-[var(--color-text-secondary)] hover:text-rose-500 hover:bg-[var(--color-surface)] rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: LIVING EXPENSES ───────────────────────────── */}
      {activeTab === "expenses" && (
        <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6">
          <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
            <div>
              <h3 className="text-base font-black text-[var(--color-text-primary)]">Monthly Living Expenses</h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Adjust your category-wise monthly expenses to see real-time impact on net surplus.</p>
            </div>
            <span className="text-sm font-black text-amber-600 dark:text-amber-400">Total: {format(totalExpenses)}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {budget.expenses.map((exp) => (
              <div key={exp.id} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl p-1.5 rounded-lg bg-[var(--color-surface)]">{exp.icon}</span>
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">{exp.label}</span>
                </div>
                <div className="pt-1">
                  <input
                    type="number"
                    min="0"
                    value={exp.amount || ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setBudget(b => ({
                        ...b,
                        expenses: b.expenses.map(ex => ex.id === exp.id ? { ...ex, amount: val } : ex)
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-black text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: EMIS & SAVINGS ─────────────────────────────── */}
      {activeTab === "commitments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider">Loan EMI Obligations</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">Automatically synchronized from your active DebtProof loan accounts.</p>
            
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
              <span className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-400">Total Monthly EMIs</span>
              <p className="text-2xl font-black text-blue-700 dark:text-blue-400">{format(monthlyEMI)}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">DTI Ratio: {debtToIncome.toFixed(1)}%</p>
            </div>
          </div>

          <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider">Monthly Investments Target</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">Set your preferred monthly investment/savings target (SIPs, FDs, Mutual Funds).</p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--color-text-secondary)]">Desired Monthly Savings</label>
              <input
                type="number"
                min="0"
                value={budget.extraSavings || ""}
                onChange={(e) => setBudget(b => ({ ...b, extraSavings: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-sm font-black text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="15000"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT INCOME ───────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-md border border-[var(--color-border)] shadow-2xl p-6 space-y-5 animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-base font-black text-[var(--color-text-primary)]">
                {editingItem ? "Edit Income Source" : "Add New Income Source"}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1">Source Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary Salary / Tech Corp"
                  value={formData.sourceName}
                  onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as IncomeStream["category"] })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="salary">💼 Salary</option>
                  <option value="rental">🏠 Rental Income</option>
                  <option value="business">🏢 Business</option>
                  <option value="freelance">💻 Freelance / Consulting</option>
                  <option value="dividends">📈 Dividends / Investments</option>
                  <option value="other">🪙 Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-text-secondary)] block mb-1">Monthly Amount</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 75000"
                  value={formData.monthlyAmount}
                  onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 btn btn-secondary text-xs py-2 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn btn-primary text-xs py-2 font-bold"
                >
                  {editingItem ? "Save Changes" : "Add Income"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
