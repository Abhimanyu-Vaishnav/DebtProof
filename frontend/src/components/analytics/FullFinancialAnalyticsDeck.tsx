/**
 * DebtProof — Comprehensive Financial Analytics Deck
 * Complete analytics for Investments, Assets, Loan Liabilities, Cashflow & Payments.
 */
"use client";

import React, { useState } from "react";
import type { DashboardData } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";

interface FullFinancialAnalyticsDeckProps {
  data: DashboardData;
  onOpenRefinance: () => void;
}

export function FullFinancialAnalyticsDeck({ data, onOpenRefinance }: FullFinancialAnalyticsDeckProps) {
  const { format } = useCurrency();
  const [activeTab, setActiveTab] = useState<"all" | "investments" | "liabilities" | "cashflow">("all");
  const [chartMode, setChartMode] = useState<"bar" | "area">("bar");

  // Calculations
  const totalPrincipal = data.total_principal_active || 1;
  const totalOutstanding = data.total_outstanding || 0;
  const totalPaid = data.total_paid_active || 0;
  const totalInterestPaid = data.total_interest_paid || 0;
  const monthlyInterestBurn = data.monthly_interest_burn || 0;
  const monthlyEmi = data.upcoming_emi_amount || 68800;

  // Mock Asset & Investment Data for holistic analytics
  const liquidAssets = 350000;
  const fixedAssets = 1200000;
  const mutualFundsSips = 450000;
  const loansGiven = 200000;
  const totalAssets = liquidAssets + fixedAssets + mutualFundsSips + loansGiven;
  const netWorth = totalAssets - totalOutstanding;
  const solvencyRatio = totalOutstanding > 0 ? (totalAssets / totalOutstanding) : 10;

  // Mock Income data
  const monthlyIncome = 145000;
  const monthlySip = 15000;
  const totalCommitments = monthlyEmi + monthlySip;
  const netSurplus = monthlyIncome - totalCommitments;
  const dtiRatio = (monthlyEmi / monthlyIncome) * 100;

  // Payment trend data
  const trendPoints = (data.monthly_trend && data.monthly_trend.length > 0)
    ? data.monthly_trend
    : [
        { month: "Feb 2026", total: 45000, count: 2 },
        { month: "Mar 2026", total: 45000, count: 2 },
        { month: "Apr 2026", total: 68800, count: 3 },
        { month: "May 2026", total: 68800, count: 3 },
        { month: "Jun 2026", total: 91508, count: 4 },
        { month: "Jul 2026", total: 91508, count: 4 },
      ];
  const maxTrend = Math.max(...trendPoints.map(t => t.total)) || 1;

  return (
    <div className="space-y-6">
      {/* ── Dimension Navigation Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--color-border)]">
        {[
          { id: "all", label: "Executive Financial Summary", icon: "🌐" },
          { id: "investments", label: "Assets & Investments", icon: "💼" },
          { id: "liabilities", label: "Liabilities & Interest Burn", icon: "💳" },
          { id: "cashflow", label: "Cashflow & DTI Safety", icon: "💵" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-[var(--color-primary)] text-white shadow-md"
                : "bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)]"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: EXECUTIVE FINANCIAL SUMMARY / ALL ── */}
      {(activeTab === "all" || activeTab === "investments") && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-2">
              <span>💼</span> Asset & Investment Portfolio Analytics
            </h3>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Total Assets: {format(totalAssets)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Net Worth Solvency */}
            <div className="card p-5 border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Calculated Net Worth</span>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{format(netWorth)}</p>
              </div>
              <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] mt-2">
                Assets ({format(totalAssets)}) minus Liabilities ({format(totalOutstanding)})
              </span>
            </div>

            {/* Solvency Coverage */}
            <div className="card p-5 border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Solvency Multiplier</span>
                <p className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">{solvencyRatio.toFixed(2)}x</p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-2">
                🟢 Strong (Assets cover debts {solvencyRatio.toFixed(1)} times over)
              </span>
            </div>

            {/* Monthly SIP Accumulator */}
            <div className="card p-5 border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Monthly SIP Investments</span>
                <p className="text-2xl font-black text-indigo-700 dark:text-indigo-400 mt-1">{format(monthlySip)}/mo</p>
              </div>
              <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] mt-2">
                Wealth Accumulator @ 12% Expected CAGR
              </span>
            </div>

            {/* 5-Year Compound Growth Projection */}
            <div className="card p-5 border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 via-[var(--color-surface)] to-[var(--color-surface)] shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">5-Yr Compound Wealth</span>
                <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-1">{format(totalAssets * 1.6 + monthlySip * 75)}</p>
              </div>
              <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] mt-2">
                Projected portfolio growth with SIP additions
              </span>
            </div>
          </div>

          {/* Asset Class Distribution Breakdown */}
          <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-text-primary)]">
              Asset Portfolio Allocation Breakdown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { name: "Liquid Bank & Cash", val: liquidAssets, pct: (liquidAssets/totalAssets)*100, color: "bg-blue-500 text-blue-700 dark:text-blue-300" },
                { name: "Real Estate & Fixed", val: fixedAssets, pct: (fixedAssets/totalAssets)*100, color: "bg-indigo-500 text-indigo-700 dark:text-indigo-300" },
                { name: "Mutual Funds & SIPs", val: mutualFundsSips, pct: (mutualFundsSips/totalAssets)*100, color: "bg-emerald-500 text-emerald-700 dark:text-emerald-300" },
                { name: "Loans Given to Others", val: loansGiven, pct: (loansGiven/totalAssets)*100, color: "bg-amber-500 text-amber-700 dark:text-amber-300" },
              ].map(item => (
                <div key={item.name} className="p-3.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
                  <span className="text-[11px] font-bold text-[var(--color-text-secondary)] block">{item.name}</span>
                  <p className="text-base font-black text-[var(--color-text-primary)] mt-1">{format(item.val)}</p>
                  <div className="w-full bg-[var(--color-surface-tertiary)] h-2 rounded-full overflow-hidden mt-2 border border-[var(--color-border)]">
                    <div className={`h-full ${item.color.split(' ')[0]}`} style={{ width: `${item.pct}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-[var(--color-text-secondary)] mt-1 block">{item.pct.toFixed(1)}% of portfolio</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: LIABILITIES & INTEREST BURN ANALYZER ── */}
      {(activeTab === "all" || activeTab === "liabilities") && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-2">
              <span>💳</span> Loan Liabilities & Interest Cost Analytics
            </h3>
            <button
              onClick={onOpenRefinance}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>🔄</span> Refinance Savings Calculator
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Principal vs Interest Cost */}
            <div className="card p-5 border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Total Paid (Principal vs Interest)</span>
              <p className="text-2xl font-black text-[var(--color-text-primary)] mt-1">{format(totalPaid + totalInterestPaid)}</p>
              <div className="mt-3 space-y-1.5 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-emerald-700 dark:text-emerald-400">Principal Cleared:</span>
                  <span className="text-[var(--color-text-primary)]">{format(totalPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-700 dark:text-rose-400">Interest Paid to Banks:</span>
                  <span className="text-[var(--color-text-primary)]">{format(totalInterestPaid)}</span>
                </div>
              </div>
            </div>

            {/* Monthly Interest Burn */}
            <div className="card p-5 border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">Monthly Interest Cost (Burn)</span>
              <p className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">{format(monthlyInterestBurn)}<span className="text-xs text-[var(--color-text-secondary)] font-normal"> /mo</span></p>
              <p className="text-[11px] font-medium text-[var(--color-text-secondary)] mt-3">
                Interest leaking from pocket every month before principal reduction.
              </p>
            </div>

            {/* Payoff Completion Index */}
            <div className="card p-5 border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Payoff Velocity Index</span>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                {((totalPaid / (totalPrincipal || 1)) * 100).toFixed(1)}%
              </p>
              <p className="text-[11px] font-medium text-[var(--color-text-secondary)] mt-3">
                {data.active_loans} active loans currently being reduced on schedule.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: CASHFLOW & DTI SAFETY ANALYTICS ── */}
      {(activeTab === "all" || activeTab === "cashflow") && (
        <div className="space-y-5">
          <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-2">
            <span>💵</span> Monthly Cashflow & Debt-to-Income (DTI) Safety Analytics
          </h3>

          <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Monthly Income</span>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{format(monthlyIncome)}</p>
                <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">Salary + Freelance + Rentals</span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">Monthly Commitments</span>
                <p className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">{format(totalCommitments)}</p>
                <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">EMI: {format(monthlyEmi)} + SIPs: {format(monthlySip)}</span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">Net Surplus Living Cash</span>
                <p className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">{format(netSurplus)}</p>
                <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">Free for lifestyle, emergency & savings</span>
              </div>
            </div>

            {/* DTI Gauge Bar */}
            <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
              <div className="flex justify-between text-xs font-bold text-[var(--color-text-primary)]">
                <span>Debt-To-Income (DTI) Leverage Meter</span>
                <span>{dtiRatio.toFixed(1)}% (Recommended &lt; 35%)</span>
              </div>
              <div className="h-4 rounded-xl bg-[var(--color-surface-tertiary)] overflow-hidden flex border border-[var(--color-border)]">
                <div
                  className={`h-full transition-all duration-700 ${
                    dtiRatio < 35 ? "bg-emerald-500" : dtiRatio < 50 ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min(dtiRatio, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-[var(--color-text-secondary)]">
                <span>0%</span>
                <span>35% Safe Threshold</span>
                <span>50% Risk Line</span>
                <span>100% Outflow</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORICAL PAYMENT TREND & VISUALIZATIONS ── */}
      <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-2">
              <span>📊</span> Historical Monthly Payment Trend Analytics
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] font-medium mt-0.5">
              Compare month-by-month repayment amounts to identify peak payment cycles
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 rounded-lg bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] text-xs">
              <button
                onClick={() => setChartMode("bar")}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  chartMode === "bar"
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                📊 Bar Chart
              </button>
              <button
                onClick={() => setChartMode("area")}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  chartMode === "area"
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                📈 Smooth Area
              </button>
            </div>
          </div>
        </div>

        {chartMode === "bar" ? (
          <div className="grid grid-cols-6 gap-3 pt-4 items-end h-44 border-b border-[var(--color-border)] pb-3">
            {trendPoints.map((p) => {
              const heightPct = Math.max(15, (p.total / maxTrend) * 100);
              return (
                <div key={p.month} className="flex flex-col items-center gap-2 h-full justify-end group relative">
                  {/* High contrast numerical badge on top of bar */}
                  <span className="text-[11px] font-black text-blue-700 dark:text-blue-300 bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 rounded-md whitespace-nowrap shadow-sm">
                    {format(p.total)}
                  </span>
                  <div className="w-full bg-[var(--color-surface-tertiary)] rounded-t-xl overflow-hidden h-full flex items-end border border-[var(--color-border)] p-1">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 via-indigo-600 to-emerald-400 group-hover:from-emerald-600 group-hover:to-teal-400 transition-all duration-500 rounded-t-lg shadow-sm"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-[var(--color-text-primary)] font-bold">{p.month}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="pt-4 space-y-3">
            <div className="relative h-44 w-full flex items-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="deckGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {(() => {
                  const points = trendPoints.map((p, idx) => {
                    const x = (idx / (trendPoints.length - 1)) * 560 + 20;
                    const y = 120 - (p.total / maxTrend) * 95;
                    return { x, y, val: p.total, month: p.month };
                  });
                  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");
                  const areaD = `${pathD} L ${points[points.length - 1].x} 130 L ${points[0].x} 130 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#deckGrad)" />
                      <path d={pathD} fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
                      {points.map((pt, i) => (
                        <g key={i}>
                          <circle cx={pt.x} cy={pt.y} r="6" fill="#047857" stroke="#ffffff" strokeWidth="2" />
                          <text x={pt.x} y={pt.y - 12} textAnchor="middle" fill="currentColor" className="text-[10px] font-black fill-[var(--color-text-primary)]">
                            {format(pt.val)}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
            <div className="flex justify-between text-xs font-extrabold text-[var(--color-text-primary)] px-2 border-t border-[var(--color-border)] pt-2">
              {trendPoints.map(p => <span key={p.month}>{p.month}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
