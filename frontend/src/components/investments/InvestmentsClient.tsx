"use client";

import React, { useState, useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { assetsService } from "@/services/assets.service";
import type { Asset } from "@/types";

export interface InvestmentItem {
  id: string;
  name: string;
  category: "mutual_fund" | "loan_given" | "property" | "fixed_asset" | "stocks_crypto";
  categoryLabel: string;
  investedAmount: number;
  currentValue: number;
  monthlyAmount: number; // SIP amount or expected monthly repayment
  returnRate: number; // e.g. 13% return
  type: "monthly_sip" | "money_lent" | "fixed_asset" | "one_time";
  institutionOrBorrower: string;
  startDate: string;
  tenureMonths?: number;
  notes?: string;
  paymentDayOfMonth?: number;
  history?: { date: string; amount: number; type: "debit" | "credit" | "yield"; status: "completed" | "scheduled" }[];
}

function mapAssetToInvestment(asset: Asset): InvestmentItem {
  const val = parseFloat(asset.value) || 0;
  let category: InvestmentItem["category"] = "fixed_asset";
  let catLabel = "Fixed Asset";

  if (asset.asset_type === "real_estate") {
    category = "property";
    catLabel = "Real Estate Property";
  } else if (asset.asset_type === "investment" || asset.asset_type === "stocks") {
    category = "mutual_fund";
    catLabel = "Mutual Funds / Stocks";
  } else if (asset.asset_type === "loan_given_short" || asset.asset_type === "loan_given_long" || asset.asset_type === "receivable") {
    category = "loan_given";
    catLabel = "Loan Given (Receivable)";
  } else if (asset.asset_type === "crypto") {
    category = "stocks_crypto";
    catLabel = "Crypto Asset";
  } else if (asset.asset_type === "bank" || asset.asset_type === "cash") {
    category = "fixed_asset";
    catLabel = "Liquid Cash / Bank";
  }

  return {
    id: asset.id,
    name: asset.name,
    category,
    categoryLabel: catLabel,
    investedAmount: val,
    currentValue: val,
    monthlyAmount: category === "mutual_fund" ? 5000 : 0,
    returnRate: category === "mutual_fund" ? 12 : category === "property" ? 10 : 7,
    type: category === "mutual_fund" ? "monthly_sip" : "one_time",
    institutionOrBorrower: asset.asset_type === "bank" ? "Bank" : "Personal Asset",
    startDate: asset.created_at ? asset.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
    notes: `Tracked asset (${asset.asset_type}).`,
    history: []
  };
}

/**
 * Calculates Future Value with Compound Growth & Monthly Contributions
 */
function calculateFutureValue(currentVal: number, monthlyContribution: number, returnRatePct: number, years: number) {
  const r = (returnRatePct || 0) / 100;
  const i = r / 12; // monthly rate
  const n = years * 12; // total months

  // Lump sum compound growth
  const lumpSumFV = currentVal * Math.pow(1 + r, years);

  // SIP Future Value formula: P * [((1+i)^n - 1) / i] * (1+i)
  let sipFV = 0;
  if (monthlyContribution > 0 && i > 0) {
    sipFV = monthlyContribution * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  } else if (monthlyContribution > 0) {
    sipFV = monthlyContribution * n;
  }

  const totalFV = lumpSumFV + sipFV;
  const totalContributed = currentVal + (monthlyContribution * n);
  const totalInterestEarned = Math.max(0, totalFV - totalContributed);

  return {
    years,
    totalFV,
    totalContributed,
    totalInterestEarned,
  };
}

export function InvestmentsClient() {
  const { format } = useCurrency();
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<InvestmentItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // New & Edit Investment Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "mutual_fund" as InvestmentItem["category"],
    investedAmount: "",
    currentValue: "",
    monthlyAmount: "",
    returnRate: "",
    type: "monthly_sip" as InvestmentItem["type"],
    institutionOrBorrower: "",
    notes: "",
    paymentDayOfMonth: "5"
  });

  const loadRealAssets = async () => {
    try {
      const dbAssets = await assetsService.getAssets();
      if (dbAssets && dbAssets.length > 0) {
        const mapped = dbAssets.map(mapAssetToInvestment);
        setInvestments(mapped);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealAssets();
  }, []);

  const openAddModal = () => {
    setFormData({
      name: "",
      category: "mutual_fund",
      investedAmount: "",
      currentValue: "",
      monthlyAmount: "",
      returnRate: "",
      type: "monthly_sip",
      institutionOrBorrower: "",
      notes: "",
      paymentDayOfMonth: "5"
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: InvestmentItem) => {
    setFormData({
      name: item.name,
      category: item.category,
      investedAmount: item.investedAmount.toString(),
      currentValue: item.currentValue.toString(),
      monthlyAmount: item.monthlyAmount.toString(),
      returnRate: item.returnRate.toString(),
      type: item.type,
      institutionOrBorrower: item.institutionOrBorrower,
      notes: item.notes || "",
      paymentDayOfMonth: (item.paymentDayOfMonth || 5).toString()
    });
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.investedAmount) return;

    const invested = parseFloat(formData.investedAmount) || 0;
    const current = parseFloat(formData.currentValue) || invested;
    const monthly = parseFloat(formData.monthlyAmount) || 0;
    const retRate = parseFloat(formData.returnRate) || 0;

    let catLabel = "Mutual Fund SIP";
    let assetType = "investment";
    if (formData.category === "loan_given") { catLabel = "Loan Given (Receivable)"; assetType = "receivable"; }
    if (formData.category === "property") { catLabel = "Real Estate Property"; assetType = "real_estate"; }
    if (formData.category === "fixed_asset") { catLabel = "Fixed Deposit / Gold"; assetType = "fd"; }
    if (formData.category === "stocks_crypto") { catLabel = "Stocks / Crypto"; assetType = "stocks"; }

    try {
      await assetsService.createAsset({
        name: formData.name,
        asset_type: assetType,
        value: current.toFixed(2)
      });
    } catch {
      /* fallback */
    }

    const newItem: InvestmentItem = {
      id: `inv-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      categoryLabel: catLabel,
      investedAmount: invested,
      currentValue: current,
      monthlyAmount: monthly,
      returnRate: retRate,
      type: formData.type,
      institutionOrBorrower: formData.institutionOrBorrower || "N/A",
      startDate: new Date().toISOString().split("T")[0],
      notes: formData.notes,
      paymentDayOfMonth: parseInt(formData.paymentDayOfMonth) || 5,
      history: monthly > 0 ? [
        { date: new Date().toISOString().split("T")[0], amount: monthly, type: formData.category === "loan_given" ? "credit" : "debit", status: "completed" }
      ] : []
    };

    setInvestments([newItem, ...investments]);
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !formData.name) return;

    const invested = parseFloat(formData.investedAmount) || selectedItem.investedAmount;
    const current = parseFloat(formData.currentValue) || selectedItem.currentValue;
    const monthly = parseFloat(formData.monthlyAmount) || 0;
    const retRate = parseFloat(formData.returnRate) || 0;

    try {
      await assetsService.updateAsset(selectedItem.id, {
        name: formData.name,
        value: current.toFixed(2)
      });
    } catch {
      /* fallback */
    }

    const updatedItem: InvestmentItem = {
      ...selectedItem,
      name: formData.name,
      category: formData.category,
      investedAmount: invested,
      currentValue: current,
      monthlyAmount: monthly,
      returnRate: retRate,
      institutionOrBorrower: formData.institutionOrBorrower,
      notes: formData.notes,
    };

    setInvestments(investments.map(item => item.id === selectedItem.id ? updatedItem : item));
    setSelectedItem(updatedItem);
    setIsEditModalOpen(false);
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this investment?")) return;
    try {
      await assetsService.deleteAsset(id);
    } catch {
      /* fallback */
    }
    setInvestments(investments.filter(i => i.id !== id));
    setSelectedItem(null);
  };

  // Filter items
  const filteredItems = investments.filter(item => {
    if (selectedCategory === "all") return true;
    return item.category === selectedCategory;
  });

  // Calculate Aggregates
  const totalInvested = investments.reduce((acc, item) => acc + item.investedAmount, 0);
  const totalCurrentValue = investments.reduce((acc, item) => acc + item.currentValue, 0);
  const totalGain = totalCurrentValue - totalInvested;
  const overallReturnPercent = totalInvested > 0 ? ((totalGain / totalInvested) * 100) : 0;

  const monthlySipOutflow = investments
    .filter(i => i.type === "monthly_sip" || (i.category === "mutual_fund" && i.monthlyAmount > 0))
    .reduce((acc, i) => acc + i.monthlyAmount, 0);

  const monthlyLoanInflow = investments
    .filter(i => i.category === "loan_given" || i.type === "money_lent")
    .reduce((acc, i) => acc + i.monthlyAmount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)] flex items-center gap-2">
            <span>📈</span> Portfolio & Investment Tracker
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Track, edit, and predict future compound value for your Mutual Funds, SIPs, Loans Given, Real Estate & Assets.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-md transition-all shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Investment / Loan Given
        </button>
      </div>

      {/* ── Key Metrics Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Portfolio Value */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Total Portfolio Value</span>
            <p className="text-2xl font-black text-[var(--color-text-primary)] mt-2">{format(totalCurrentValue)}</p>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
              <span>▲</span> +{overallReturnPercent.toFixed(1)}% Return
            </span>
            <span className="text-[11px] text-[var(--color-text-secondary)]">({format(totalGain)} gain)</span>
          </div>
        </div>

        {/* Card 2: Total Capital Invested */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Total Capital Invested</span>
            <p className="text-2xl font-black text-[var(--color-text-primary)] mt-2">{format(totalInvested)}</p>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-3 flex items-center gap-1 font-medium">
            <span>📦</span> Across {investments.length} active assets & receivables
          </p>
        </div>

        {/* Card 3: Monthly Investment Outflow (SIPs) */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">Monthly SIP Outflow</span>
            <p className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-2">{format(monthlySipOutflow)}<span className="text-xs font-normal text-[var(--color-text-secondary)]"> /mo</span></p>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-3 font-medium">
            Auto-debited across SIPs & monthly deposits
          </p>
        </div>

        {/* Card 4: Monthly Expected Inflows (Loan Given) */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">Monthly Loan Inflows</span>
            <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-2">{format(monthlyLoanInflow)}<span className="text-xs font-normal text-[var(--color-text-secondary)]"> /mo</span></p>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-3 font-medium">
            Repayments expected from loans given to others
          </p>
        </div>
      </div>

      {/* ── Tabs & Category Filters ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "all", label: "All Investments", icon: "📊" },
          { id: "mutual_fund", label: "Mutual Funds & SIPs", icon: "📈" },
          { id: "loan_given", label: "Loans Given to Others", icon: "🤝" },
          { id: "property", label: "Real Estate & Property", icon: "🏠" },
          { id: "fixed_asset", label: "Fixed Deposits & Gold", icon: "💎" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === tab.id
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)]"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Investment Items List ── */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider">
            Active Holdings & Receivables ({filteredItems.length})
          </h2>
          <span className="text-xs text-[var(--color-text-secondary)] font-medium">
            Click any item to view details, edit, or predict future growth
          </span>
        </div>

        <div className="divide-y divide-[var(--color-border)]">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-text-secondary)]">
              No investments found in this category. Click &quot;Add Investment&quot; to add one.
            </div>
          ) : (
            filteredItems.map((item) => {
              const gain = item.currentValue - item.investedAmount;
              const returnPct = item.investedAmount > 0 ? (gain / item.investedAmount) * 100 : 0;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="p-5 hover:bg-[var(--color-surface-secondary)] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border border-[var(--color-border)] ${
                      item.category === "mutual_fund" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                      item.category === "loan_given" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                      item.category === "property" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                    }`}>
                      {item.category === "mutual_fund" ? "📈" :
                       item.category === "loan_given" ? "🤝" :
                       item.category === "property" ? "🏠" : "💎"}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-light)] transition-colors">
                          {item.name}
                        </h3>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--color-surface-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)]">
                          {item.categoryLabel}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-secondary)] mt-1.5 font-medium">
                        <span>Institution/Borrower: <strong className="text-[var(--color-text-primary)]">{item.institutionOrBorrower}</strong></span>
                        {item.monthlyAmount > 0 && (
                          <span className="text-blue-700 dark:text-blue-400 font-bold">
                            {item.category === "loan_given" ? "Monthly Inflow: " : "Monthly SIP: "}
                            {format(item.monthlyAmount)}
                          </span>
                        )}
                        {item.returnRate > 0 && (
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                            Return Rate: {item.returnRate}% p.a.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--color-border)]">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold block">Current Valuation</span>
                      <span className="text-base font-black text-[var(--color-text-primary)]">{format(item.currentValue)}</span>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold block">Returns / Growth</span>
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-md inline-block ${
                        gain >= 0 ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20" : "bg-red-500/15 text-red-800 dark:text-red-300 border border-red-500/20"
                      }`}>
                        {gain >= 0 ? "+" : ""}{format(gain)} ({returnPct.toFixed(1)}%)
                      </span>
                    </div>

                    <div className="hidden sm:block text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Detailed View & Compound Growth Prediction Modal ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-[var(--color-border)] flex items-start justify-between gap-4 bg-[var(--color-surface-secondary)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-surface)] flex items-center justify-center text-2xl border border-[var(--color-border)]">
                  {selectedItem.category === "mutual_fund" ? "📈" :
                   selectedItem.category === "loan_given" ? "🤝" :
                   selectedItem.category === "property" ? "🏠" : "💎"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      {selectedItem.categoryLabel}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[var(--color-text-primary)] mt-1">
                    {selectedItem.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(selectedItem)}
                  className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 font-semibold text-xs border border-blue-500/20 transition-all flex items-center gap-1"
                >
                  ✎ Edit Item
                </button>
                <button
                  onClick={() => handleDeleteItem(selectedItem.id)}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 font-semibold text-xs border border-red-500/20 transition-all"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] rounded-xl transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Financial Highlight Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
                <div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] font-bold uppercase block">Current Valuation</span>
                  <span className="text-lg font-black text-emerald-400">{format(selectedItem.currentValue)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] font-bold uppercase block">Invested Amount</span>
                  <span className="text-lg font-black text-[var(--color-text-primary)]">{format(selectedItem.investedAmount)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] font-bold uppercase block">Expected CAGR</span>
                  <span className="text-lg font-black text-emerald-400">{selectedItem.returnRate}% p.a.</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] font-bold uppercase block">
                    {selectedItem.category === "loan_given" ? "Monthly Inflow" : "Monthly SIP"}
                  </span>
                  <span className="text-lg font-black text-blue-400">
                    {selectedItem.monthlyAmount > 0 ? format(selectedItem.monthlyAmount) : "N/A"}
                  </span>
                </div>
              </div>

              {/* ── Mini Growth Chart: Invested vs Current Value ── */}
              {(() => {
                const invested = selectedItem.investedAmount;
                const current = selectedItem.currentValue;
                const gain = current - invested;
                const gainPct = invested > 0 ? ((gain / invested) * 100) : 0;
                const isPositive = gain >= 0;

                // Build a 6-point growth curve from start to now
                const startDate = new Date(selectedItem.startDate);
                const now = new Date();
                const months = Math.max(1, (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth()));
                const points = Array.from({ length: 7 }, (_, i) => {
                  const t = i / 6;
                  const monthsIn = Math.floor(t * months);
                  const r = (selectedItem.returnRate || 0) / 100;
                  const investedAtT = invested + selectedItem.monthlyAmount * monthsIn;
                  const valueAtT = invested * Math.pow(1 + r / 12, monthsIn) + (selectedItem.monthlyAmount > 0 && r > 0
                    ? selectedItem.monthlyAmount * ((Math.pow(1 + r / 12, monthsIn) - 1) / (r / 12))
                    : selectedItem.monthlyAmount * monthsIn);
                  return { t, invested: investedAtT, value: valueAtT };
                });

                const maxVal = Math.max(...points.map(p => Math.max(p.invested, p.value)), 1);
                const W = 400; const H = 80; const pad = 8;

                const toY = (v: number) => H - pad - ((v / maxVal) * (H - 2 * pad));
                const toX = (t: number) => pad + t * (W - 2 * pad);

                const investedPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.t)} ${toY(p.invested)}`).join(" ");
                const valuePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.t)} ${toY(p.value)}`).join(" ");
                const valueArea = `${valuePath} L ${toX(1)} ${H} L ${toX(0)} ${H} Z`;

                return (
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-secondary)] overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--color-border)]">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-wider text-[var(--color-text-primary)]">📊 Investment Growth Chart</p>
                        <p className="text-[10px] font-medium text-[var(--color-text-secondary)] mt-0.5">Invested amount vs current portfolio value over time</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-black ${isPositive ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-rose-500/15 text-rose-700 dark:text-rose-400"}`}>
                        {isPositive ? "▲" : "▼"} {Math.abs(gainPct).toFixed(1)}% returns
                      </div>
                    </div>

                    {/* Key numbers */}
                    <div className="grid grid-cols-3 gap-3 px-4 py-3">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Invested</p>
                        <p className="text-sm font-black text-[var(--color-text-primary)] mt-0.5">{format(invested)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Current Value</p>
                        <p className={`text-sm font-black mt-0.5 ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{format(current)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Total Gain</p>
                        <p className={`text-sm font-black mt-0.5 ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {isPositive ? "+" : ""}{format(gain)}
                        </p>
                      </div>
                    </div>

                    {/* SVG Chart */}
                    <div className="px-2 pb-3">
                      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id={`gain-grad-${selectedItem.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        {[0.25, 0.5, 0.75].map(pct => (
                          <line key={pct} x1={pad} y1={toY(maxVal * pct)} x2={W - pad} y2={toY(maxVal * pct)}
                            stroke="var(--color-border)" strokeDasharray="3 3" opacity="0.5" />
                        ))}
                        {/* Value area fill */}
                        <path d={valueArea} fill={`url(#gain-grad-${selectedItem.id})`} />
                        {/* Invested line (dashed grey) */}
                        <path d={investedPath} fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
                        {/* Value line (solid) */}
                        <path d={valuePath} fill="none" stroke={isPositive ? "#10b981" : "#f43f5e"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        {/* End dot */}
                        <circle cx={toX(1)} cy={toY(points[6].value)} r="4" fill={isPositive ? "#10b981" : "#f43f5e"} />
                      </svg>
                      <div className="flex items-center justify-between px-2 mt-1">
                        <span className="text-[9px] font-bold text-[var(--color-text-secondary)]">{selectedItem.startDate}</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[9px] font-bold text-[var(--color-text-secondary)]">
                            <span className="w-3 border-t border-dashed border-[var(--color-text-tertiary)] inline-block" /> Capital
                          </span>
                          <span className="flex items-center gap-1 text-[9px] font-bold text-[var(--color-text-secondary)]">
                            <span className="w-3 border-t-2 inline-block" style={{ borderColor: isPositive ? "#10b981" : "#f43f5e" }} /> Value
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-[var(--color-text-secondary)]">Today</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ── Future Value Compound Wealth Predictor ── */}
              <div className="space-y-3 p-5 rounded-2xl bg-gradient-to-br from-[#0c1f38] to-[#122844] border border-blue-500/20 text-white shadow-md">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                    <span>🚀</span> Future Compound Growth Predictor
                  </h4>
                  <span className="text-[10px] bg-blue-500/20 text-blue-200 px-2.5 py-0.5 rounded-full font-semibold">
                    Calculated @ {selectedItem.returnRate}% CAGR
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {[1, 3, 5, 10].map((yr) => {
                    const fv = calculateFutureValue(selectedItem.currentValue, selectedItem.monthlyAmount, selectedItem.returnRate, yr);
                    return (
                      <div key={yr} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-400/30 transition-all">
                        <span className="text-[10px] text-blue-200 uppercase font-semibold block">{yr} Year Projection</span>
                        <span className="text-base font-black text-emerald-300 mt-1 block">{format(fv.totalFV)}</span>
                        <span className="text-[10px] text-blue-200/70 block mt-0.5">
                          +{format(fv.totalInterestEarned)} growth
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[15, 20].map((yr) => {
                    const fv = calculateFutureValue(selectedItem.currentValue, selectedItem.monthlyAmount, selectedItem.returnRate, yr);
                    return (
                      <div key={yr} className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-blue-950/40 border border-emerald-500/20 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-emerald-300 uppercase font-bold block">{yr} Years Long-Term Wealth</span>
                          <span className="text-xl font-black text-white mt-0.5 block">{format(fv.totalFV)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-emerald-400 font-bold block">
                            Interest Earned: +{format(fv.totalInterestEarned)}
                          </span>
                          <span className="text-[10px] text-blue-200 block">
                            Capital Contributed: {format(fv.totalContributed)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Overview & Contract Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Overview & Entity Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-[var(--color-surface-tertiary)]">
                    <span className="text-[var(--color-text-tertiary)] block">Entity / Borrower / AMC:</span>
                    <strong className="text-sm font-semibold text-[var(--color-text-primary)] mt-0.5 block">
                      {selectedItem.institutionOrBorrower}
                    </strong>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--color-surface-tertiary)]">
                    <span className="text-[var(--color-text-tertiary)] block">Start Date:</span>
                    <strong className="text-sm font-semibold text-[var(--color-text-primary)] mt-0.5 block">
                      {selectedItem.startDate}
                    </strong>
                  </div>
                  {selectedItem.notes && (
                    <div className="p-3 rounded-lg bg-[var(--color-surface-tertiary)] col-span-1 sm:col-span-2">
                      <span className="text-[var(--color-text-tertiary)] block">Notes & Description:</span>
                      <p className="text-xs text-[var(--color-text-primary)] mt-0.5">
                        {selectedItem.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface-secondary)] flex justify-between items-center">
              <button
                onClick={() => openEditModal(selectedItem)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-500 transition-all shadow-sm"
              >
                ✎ Edit Investment Details
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2 rounded-xl bg-[var(--color-surface-tertiary)] text-[var(--color-text-primary)] font-semibold text-xs hover:bg-[var(--color-border)] transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Investment Modal ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                Edit Investment Details
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                  Investment Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as InvestmentItem["category"] })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value="mutual_fund">Mutual Fund / SIP</option>
                    <option value="loan_given">Loan Given (Money Lent)</option>
                    <option value="property">Real Estate & Property</option>
                    <option value="fixed_asset">FD / Fixed Asset / Gold</option>
                    <option value="stocks_crypto">Stocks & Crypto</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                    Institution / Borrower Name
                  </label>
                  <input
                    type="text"
                    value={formData.institutionOrBorrower}
                    onChange={e => setFormData({ ...formData, institutionOrBorrower: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                    Current Estimated Valuation (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.currentValue}
                    onChange={e => setFormData({ ...formData, currentValue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                    Monthly SIP / Inflow (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyAmount}
                    onChange={e => setFormData({ ...formData, monthlyAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                  Expected Return Rate (% p.a.)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.returnRate}
                  onChange={e => setFormData({ ...formData, returnRate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                  Notes & Description
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Investment Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                Add New Investment / Loan Given
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                  Investment / Receivable Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Blue Chip Fund or Loan to Ramesh"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as InvestmentItem["category"] })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value="mutual_fund">Mutual Fund / SIP</option>
                    <option value="loan_given">Loan Given (Money Lent)</option>
                    <option value="property">Real Estate & Property</option>
                    <option value="fixed_asset">FD / Fixed Asset / Gold</option>
                    <option value="stocks_crypto">Stocks & Crypto</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                    Institution / Borrower Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Mutual Fund or Rahul"
                    value={formData.institutionOrBorrower}
                    onChange={e => setFormData({ ...formData, institutionOrBorrower: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                    Invested Amount (Principal)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    required
                    value={formData.investedAmount}
                    onChange={e => setFormData({ ...formData, investedAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                    Current Estimated Valuation
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 55000"
                    value={formData.currentValue}
                    onChange={e => setFormData({ ...formData, currentValue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                    Monthly SIP / Repayment (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 7000"
                    value={formData.monthlyAmount}
                    onChange={e => setFormData({ ...formData, monthlyAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                    Expected Return Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 13"
                    value={formData.returnRate}
                    onChange={e => setFormData({ ...formData, returnRate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                  Notes & Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Details about monthly payouts, due dates, terms..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
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
                  Save Investment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
