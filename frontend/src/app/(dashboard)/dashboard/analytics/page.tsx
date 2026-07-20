/**
 * DebtProof — Analytics Page
 * Pure SVG/CSS charts: loan distribution, monthly payments, debt overview.
 */
"use client";

import React, { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { loansService } from "@/services/loans.service";
import { formatCurrency } from "@/utils/formatters";
import { LOAN_TYPE_LABELS } from "@/types";
import type { DashboardData } from "@/types";

// ── Donut Chart (SVG) ─────────────────────────────────────────
const DONUT_COLORS = [
  "#1a3a5c", "#2563a8", "#10b981", "#f59e0b", "#7c3aed", "#3b82f6", "#ef4444",
];

function DonutChart({
  data,
  total,
}: {
  data: { label: string; count: number; color: string }[];
  total: number;
}) {
  const SIZE = 160;
  const RADIUS = 60;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const STROKE = 22;
  const circumference = 2 * Math.PI * RADIUS;

  let offset = 0;

  const segments = data.map((item) => {
    const pct = total > 0 ? item.count / total : 0;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const startOffset = circumference - offset;
    offset += dash;
    return { ...item, dash, gap, startOffset };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          {/* Track */}
          <circle
            cx={CX} cy={CY} r={RADIUS}
            fill="none"
            stroke="var(--color-surface-tertiary)"
            strokeWidth={STROKE}
          />
          {segments.map((seg) => (
            <circle
              key={seg.label}
              cx={CX} cy={CY} r={RADIUS}
              fill="none"
              stroke={seg.color}
              strokeWidth={STROKE}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={seg.startOffset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-[var(--color-text-primary)]">{total}</span>
          <span className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-widest mt-1">Loans</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 w-full mt-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ background: item.color }} />
              <span className="text-sm font-medium text-[var(--color-text-secondary)] truncate">{item.label}</span>
            </div>
            <span className="text-sm font-bold text-[var(--color-text-primary)] shrink-0 bg-[var(--color-surface-tertiary)] px-2 py-0.5 rounded-full">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bar Chart (CSS) ───────────────────────────────────────────
function BarChart({ data }: { data: { month: string; total: number; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="flex items-end gap-3 h-48 pt-4 w-full">
      {data.map((item) => {
        const height = Math.max(8, (item.total / max) * 160);
        return (
          <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group relative cursor-pointer" title={`${item.month}: ${formatCurrency(item.total)}`}>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 bg-[var(--color-surface-inverse)] text-[var(--color-text-inverse)] text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl pointer-events-none z-10 flex flex-col items-center">
              <span className="font-bold">{formatCurrency(item.total)}</span>
              <span className="text-[10px] opacity-80">{item.count} payment{item.count !== 1 ? "s" : ""}</span>
            </div>
            <div
              className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-[var(--color-primary-light)] to-[var(--color-primary)] group-hover:from-[var(--color-accent-light)] group-hover:to-[var(--color-accent)] transition-all duration-300 shadow-md shadow-primary/20"
              style={{ height: `${height}px` }}
            />
            <span className="text-xs font-semibold text-[var(--color-text-tertiary)] leading-none mt-1">
              {item.month.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Progress Ring (SVG) ───────────────────────────────────────
function ProgressRing({ value, label, color = "#10b981" }: { value: number; label: string; color?: string }) {
  const R = 30;
  const C = 2 * Math.PI * R;
  const dash = (value / 100) * C;
  const gap = C - dash;

  return (
    <div className="flex flex-col items-center gap-2 transition-transform hover:scale-105 duration-200">
      <div className="relative drop-shadow-sm">
        <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
          <circle cx="45" cy="45" r={R} fill="none" stroke="var(--color-surface-tertiary)" strokeWidth="10" />
          <circle
            cx="45" cy="45" r={R} fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={`${dash} ${gap}`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black text-[var(--color-text-primary)]">{Math.round(value)}%</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-[var(--color-text-secondary)] text-center leading-tight tracking-wide">{label}</span>
    </div>
  );
}

// ── Main Analytics Page ───────────────────────────────────────
export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loansService.getDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <>
      <Topbar title="Analytics" subtitle="Financial insights" />
      <main className="page-content"><LoadingSpinner fullPage label="Loading analytics..." /></main>
    </>
  );

  if (!data) return (
    <>
      <Topbar title="Analytics" subtitle="Financial insights" />
      <main className="page-content">
        <div className="card p-8 text-center text-[var(--color-text-secondary)]">No data available.</div>
      </main>
    </>
  );

  const totalPrincipal = data.total_principal_active;
  const totalOutstanding = data.total_outstanding;
  const totalPaid = data.total_paid_active;
  const repaymentPct = totalPrincipal > 0 ? (totalPaid / totalPrincipal) * 100 : 0;
  const outstandingPct = totalPrincipal > 0 ? (totalOutstanding / totalPrincipal) * 100 : 0;

  const donutData = data.type_distribution.map((item, i) => ({
    label: LOAN_TYPE_LABELS[item.loan_type as keyof typeof LOAN_TYPE_LABELS] ?? item.loan_type,
    count: item.count,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));

  const monthlyTotal = data.monthly_trend.reduce((sum, m) => sum + m.total, 0);
  const monthlyCount = data.monthly_trend.reduce((sum, m) => sum + m.count, 0);
  const avgMonthly = data.monthly_trend.length > 0 ? monthlyTotal / data.monthly_trend.length : 0;

  return (
    <>
      <Topbar title="Analytics" subtitle="Financial insights and trends" />
      <main className="page-content space-y-5">
        {/* Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Loans", value: data.total_loans.toString(), sub: `${data.active_loans} active`, color: "text-[var(--color-primary)]", bg: "bg-blue-50 dark:bg-blue-900/10" },
            { label: "Total Borrowing", value: formatCurrency(data.total_principal_all), sub: "All time", color: "text-[var(--color-text-primary)]", bg: "bg-gray-50 dark:bg-gray-800/30" },
            { label: "Total Repaid", value: formatCurrency(totalPaid), sub: "Active loans", color: "text-[var(--color-accent)]", bg: "bg-emerald-50 dark:bg-emerald-900/10" },
            { label: "Total Outstanding", value: formatCurrency(totalOutstanding), sub: data.overdue_count > 0 ? `${data.overdue_count} overdue` : "On track", color: data.overdue_count > 0 ? "text-[var(--color-error)]" : "text-[var(--color-primary-dark)]", bg: data.overdue_count > 0 ? "bg-red-50 dark:bg-red-900/10" : "bg-indigo-50 dark:bg-indigo-900/10" },
          ].map((kpi) => (
            <div key={kpi.label} className={`card p-5 border border-[var(--color-border-light)] ${kpi.bg} shadow-sm hover:shadow-md transition-shadow`}>
              <p className="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest mb-1.5">{kpi.label}</p>
              <p className={`text-2xl font-black ${kpi.color} leading-tight`}>{kpi.value}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <div className={`w-1.5 h-1.5 rounded-full ${kpi.color.replace('text-', 'bg-')}`} />
                <p className="text-xs font-medium text-[var(--color-text-secondary)]">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Loan Type Donut */}
          <div className="card p-6 shadow-sm border border-[var(--color-border-light)]">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)] mb-6">
              Loan Portfolio
            </h2>
            {data.total_loans === 0 ? (
              <div className="text-center py-12 text-sm font-medium text-[var(--color-text-tertiary)] bg-[var(--color-surface-secondary)] rounded-xl">No loans yet</div>
            ) : (
              <DonutChart data={donutData} total={data.total_loans} />
            )}
          </div>

          {/* Repayment Progress Rings */}
          <div className="card p-6 shadow-sm border border-[var(--color-border-light)]">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)] mb-6">
              Repayment Health
            </h2>
            <div className="flex flex-wrap justify-around gap-6">
              <ProgressRing value={repaymentPct} label="Repaid" color="#10b981" />
              <ProgressRing value={outstandingPct} label="Outstanding" color="#ef4444" />
              <ProgressRing
                value={data.total_loans > 0 ? (data.closed_loans / data.total_loans) * 100 : 0}
                label="Closed"
                color="#3b82f6"
              />
            </div>
            <div className="mt-8 pt-6 border-t border-[var(--color-border-light)] grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-xl bg-[var(--color-surface-secondary)]">
                <p className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-1">Active</p>
                <p className="text-2xl font-black text-[var(--color-primary)]">{data.active_loans}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-[var(--color-surface-secondary)]">
                <p className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-1">Closed</p>
                <p className="text-2xl font-black text-[var(--color-accent)]">{data.closed_loans}</p>
              </div>
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="card p-6 shadow-sm border border-[var(--color-border-light)]">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)] mb-6">
              6-Month Summary
            </h2>
            <div className="space-y-4 mb-6">
              {[
                { label: "Total Paid (6 mo)", value: formatCurrency(monthlyTotal) },
                { label: "Total Payments", value: monthlyCount.toString() },
                { label: "Avg Monthly", value: formatCurrency(avgMonthly) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between pb-3 border-b border-[var(--color-border-light)] last:border-0 last:pb-0">
                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</span>
                  <span className="text-base font-bold text-[var(--color-text-primary)]">{value}</span>
                </div>
              ))}
            </div>
            {data.upcoming_emi_date && (
              <div className="pt-4 border-t-2 border-dashed border-[var(--color-border-light)] bg-[var(--color-warning)]/5 p-4 rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-1">Next EMI Due</p>
                    <p className="text-sm font-semibold text-[var(--color-text-secondary)]">{data.upcoming_emi_date}</p>
                  </div>
                  <p className="text-lg font-black text-[var(--color-warning)]">{formatCurrency(data.upcoming_emi_amount)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Payment Bar Chart */}
        {data.monthly_trend.length > 0 && (
          <div className="card p-6 shadow-sm border border-[var(--color-border-light)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
                Monthly Payment Trend
              </h2>
              <span className="text-xs font-semibold px-3 py-1 bg-[var(--color-surface-secondary)] text-[var(--color-text-tertiary)] rounded-full">Last {data.monthly_trend.length} months</span>
            </div>
            <BarChart data={data.monthly_trend} />
          </div>
        )}

        {/* Blockchain Readiness Card */}
        <div className="card p-8 border border-emerald-500/30 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] text-white shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-pulse" />
          <div className="flex items-start gap-5 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-white mb-2 tracking-wide flex items-center gap-3">
                Monad Blockchain Integration Active
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-medium max-w-4xl">
                Every payment receipt is SHA-256 hashed and anchored on the Monad Blockchain. 
                This creates immutable, tamper-proof proof of repayment that anyone can verify 
                publicly without compromising your privacy or relying on centralized servers.
              </p>
              <div className="mt-5 flex items-center gap-3 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/10">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" />
                <span className="text-sm text-emerald-400 font-bold tracking-wide">Tamper-Proof Anchoring Live</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
