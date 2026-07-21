"use client";

import React, { useState, useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

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

interface IncomeTrackerWidgetProps {
  monthlyEmiTotal?: number;
  monthlySipTotal?: number;
}

export function IncomeTrackerWidget({ monthlyEmiTotal = 68800, monthlySipTotal = 12000 }: IncomeTrackerWidgetProps) {
  const { format } = useCurrency();
  const [incomes, setIncomes] = useState<IncomeStream[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IncomeStream | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    sourceName: "",
    category: "salary" as IncomeStream["category"],
    monthlyAmount: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("debtproof_income_streams");
    if (saved) {
      try {
        setIncomes(JSON.parse(saved));
        return;
      } catch {
        /* ignore */
      }
    }
    setIncomes(DEFAULT_INCOMES);
  }, []);

  const saveIncomes = (items: IncomeStream[]) => {
    setIncomes(items);
    localStorage.setItem("debtproof_income_streams", JSON.stringify(items));
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

    const amt = parseFloat(formData.monthlyAmount) || 0;
    let label = "Salary";
    if (formData.category === "rental") label = "Rent";
    if (formData.category === "business") label = "Business";
    if (formData.category === "freelance") label = "Freelance";
    if (formData.category === "dividends") label = "Dividends";
    if (formData.category === "other") label = "Other Income";

    if (editingItem) {
      // Update existing item
      const updated = incomes.map((i) =>
        i.id === editingItem.id
          ? {
              ...i,
              sourceName: formData.sourceName,
              category: formData.category,
              categoryLabel: label,
              monthlyAmount: amt,
            }
          : i
      );
      saveIncomes(updated);
    } else {
      // Create new item
      const item: IncomeStream = {
        id: `inc-${Date.now()}`,
        sourceName: formData.sourceName,
        category: formData.category,
        categoryLabel: label,
        monthlyAmount: amt,
        isRecurring: true,
      };
      saveIncomes([item, ...incomes]);
    }

    setIsAddModalOpen(false);
    setEditingItem(null);
    setFormData({ sourceName: "", category: "salary", monthlyAmount: "" });
  };

  const handleDeleteIncome = (id: string) => {
    if (!confirm("Are you sure you want to delete this income source?")) return;
    saveIncomes(incomes.filter((i) => i.id !== id));
  };

  // Aggregates
  const totalMonthlyIncome = incomes.reduce((acc, i) => acc + i.monthlyAmount, 0);
  const totalMonthlyOutflow = monthlyEmiTotal + monthlySipTotal;
  const remainingCashflow = totalMonthlyIncome - totalMonthlyOutflow;

  const dtiRatio = totalMonthlyIncome > 0 ? (monthlyEmiTotal / totalMonthlyIncome) * 100 : 0;
  const totalOutflowRatio = totalMonthlyIncome > 0 ? (totalMonthlyOutflow / totalMonthlyIncome) * 100 : 0;

  // Danger Status
  let statusColor = "emerald";
  let statusTitle = "Healthy Cashflow";
  let statusDesc = "Your EMI payments are within a safe limits (< 35% of income).";

  if (dtiRatio >= 35 && dtiRatio <= 50) {
    statusColor = "amber";
    statusTitle = "Moderate Leverage";
    statusDesc = "EMIs consume 35%-50% of monthly income. Keep track before taking new debt.";
  } else if (dtiRatio > 50 || remainingCashflow < 0) {
    statusColor = "rose";
    statusTitle = "⚠️ High Overleveraged Alert!";
    statusDesc = remainingCashflow < 0
      ? "CRITICAL: Your total EMIs and investments exceed your monthly income!"
      : "DANGER: EMIs consume >50% of your income. High risk of cash crunch.";
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="text-base font-black text-[var(--color-text-primary)] flex items-center gap-2">
            <span>💵</span> Monthly Income & Outflow Safety Meter
          </h2>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
            Track and edit all income sources to ensure your EMIs & investments stay within safe limits.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all shrink-0 flex items-center gap-1.5"
        >
          <span>+</span> Add Income Source
        </button>
      </div>

      {/* Income vs Outflow Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Income Card */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Total Monthly Income</span>
            <p className="text-2xl font-black text-[var(--color-text-primary)] mt-1">{format(totalMonthlyIncome)}</p>
          </div>
          <span className="text-[11px] text-[var(--color-text-secondary)] font-medium mt-2">Across {incomes.length} income stream(s)</span>
        </div>

        {/* Total EMI & Outflow Card */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">Total Monthly Commitments</span>
            <p className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">{format(totalMonthlyOutflow)}</p>
          </div>
          <span className="text-[11px] text-[var(--color-text-secondary)] font-medium mt-2">
            EMI: {format(monthlyEmiTotal)} · SIPs: {format(monthlySipTotal)}
          </span>
        </div>

        {/* Net Free Cashflow */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex flex-col justify-between">
          <div>
            <span className={`text-xs font-black uppercase tracking-wider ${remainingCashflow >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
              Net Free Cash Flow
            </span>
            <p className={`text-2xl font-black mt-1 ${remainingCashflow >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
              {format(remainingCashflow)}
            </p>
          </div>
          <span className="text-[11px] text-[var(--color-text-secondary)] font-medium mt-2">Available for living expenses & savings</span>
        </div>
      </div>

      {/* Safety Gauge Alert Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        statusColor === "emerald" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-900 dark:text-emerald-200" :
        statusColor === "amber" ? "bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-200" : "bg-rose-500/15 border-rose-500/30 text-rose-900 dark:text-rose-200"
      }`}>
        <div className="flex items-start gap-3">
          <div className="text-2xl shrink-0">
            {statusColor === "emerald" ? "🛡️" : statusColor === "amber" ? "⚡" : "🚨"}
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--color-text-primary)]">{statusTitle}</h3>
            <p className="text-xs font-medium text-[var(--color-text-primary)] mt-0.5">{statusDesc}</p>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="text-[10px] font-black uppercase tracking-wider block text-[var(--color-text-secondary)]">Debt-To-Income (DTI) Ratio</span>
          <span className="text-xl font-black text-[var(--color-text-primary)]">{dtiRatio.toFixed(1)}%</span>
        </div>
      </div>

      {/* Visual DTI Bar Meter */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold text-[var(--color-text-secondary)]">
          <span>Monthly Income Distribution</span>
          <span>{totalOutflowRatio.toFixed(1)}% Committed</span>
        </div>
        <div className="h-4 rounded-xl bg-[var(--color-surface-tertiary)] overflow-hidden flex border border-[var(--color-border)]">
          <div
            className="h-full bg-rose-500 transition-all duration-500"
            style={{ width: `${Math.min(dtiRatio, 100)}%` }}
            title={`EMI Debt: ${dtiRatio.toFixed(1)}%`}
          />
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${Math.min(totalOutflowRatio - dtiRatio, 100 - dtiRatio)}%` }}
            title="Investments/SIPs"
          />
          <div className="h-full bg-emerald-500 flex-1 transition-all duration-500" title="Free Cashflow" />
        </div>
        <div className="flex items-center gap-4 text-[11px] font-semibold text-[var(--color-text-secondary)] pt-1">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> EMI Debt ({dtiRatio.toFixed(1)}%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> SIPs & Investments</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Free Living Cash</span>
        </div>
      </div>

      {/* Income Streams Breakdown Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text-primary)]">
          Your Active Income Streams ({incomes.length})
        </h3>
        <div className="divide-y divide-[var(--color-border)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          {incomes.length === 0 ? (
            <p className="p-4 text-center text-xs text-[var(--color-text-secondary)] font-medium">No income streams added yet.</p>
          ) : (
            incomes.map((inc) => (
              <div key={inc.id} className="p-3.5 flex items-center justify-between bg-[var(--color-surface)] hover:bg-[var(--color-surface-secondary)] text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border)] flex items-center justify-center text-base">
                    {inc.category === "salary" ? "💼" : inc.category === "rental" ? "🏠" : inc.category === "freelance" ? "💻" : "📈"}
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-[var(--color-text-primary)] block">{inc.sourceName}</strong>
                    <span className="text-[10px] text-[var(--color-text-secondary)] font-medium">{inc.categoryLabel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">+{format(inc.monthlyAmount)}<span className="text-[10px] font-semibold text-[var(--color-text-secondary)]"> /mo</span></span>
                  <button
                    onClick={() => openEditModal(inc)}
                    className="text-[11px] font-extrabold text-blue-700 dark:text-blue-400 hover:underline px-1 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteIncome(inc.id)}
                    className="text-[11px] font-extrabold text-red-700 dark:text-red-400 hover:underline px-1 cursor-pointer"
                  >
                    Del
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add / Edit Income Stream Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-4">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                {editingItem ? "Edit Income Source" : "Add Monthly Income Source"}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-xs text-[var(--color-text-tertiary)]">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">Source Name</label>
                <input
                  type="text"
                  placeholder="e.g. Primary Job Salary or Apartment Rent"
                  required
                  value={formData.sourceName}
                  onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as IncomeStream["category"] })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value="salary">Salary / Job</option>
                    <option value="rental">Rental Income</option>
                    <option value="freelance">Freelance / Business</option>
                    <option value="dividends">Dividends / Profit</option>
                    <option value="other">Other Income</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">Monthly Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 85000"
                    required
                    value={formData.monthlyAmount}
                    onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md"
                >
                  {editingItem ? "Save Changes" : "Add Income Stream"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
