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
          <span className="text-2xl font-bold text-[var(--color-text-primary)]">{total}</span>
          <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Loans</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-1.5 w-full">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
              <span className="text-xs text-[var(--color-text-secondary)] truncate">{item.label}</span>
            </div>
            <span className="text-xs font-semibold text-[var(--color-text-primary)] shrink-0">{item.count}</span>
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
    <div className="flex items-end gap-2 h-40 pt-2">
      {data.map((item) => {
        const height = Math.max(4, (item.total / max) * 140);
        return (
          <div key={item.month} className="flex-1 flex flex-col items-center gap-1 group relative" title={`${item.month}: ${formatCurrency(item.total)}`}>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-primary)] text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap pointer-events-none z-10">
              {formatCurrency(item.total)} · {item.count} payment{item.count !== 1 ? "s" : ""}
            </div>
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-primary-light)] group-hover:from-[var(--color-accent)] group-hover:to-[var(--color-accent-light)] transition-colors"
              style={{ height: `${height}px` }}
            />
            <span className="text-[9px] text-[var(--color-text-tertiary)] leading-none">
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
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
          <circle cx="40" cy="40" r={R} fill="none" stroke="var(--color-surface-tertiary)" strokeWidth="8" />
          <circle
            cx="40" cy="40" r={R} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${gap}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[13px] font-bold text-[var(--color-text-primary)]">{Math.round(value)}%</span>
        </div>
      </div>
      <span className="text-[11px] text-[var(--color-text-secondary)] text-center leading-tight">{label}</span>
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
            { label: "Total Loans", value: data.total_loans.toString(), sub: `${data.active_loans} active`, color: "text-[var(--color-primary)]" },
            { label: "Total Borrowing", value: formatCurrency(data.total_principal_all), sub: "All time", color: "text-[var(--color-text-primary)]" },
            { label: "Total Repaid", value: formatCurrency(totalPaid), sub: "Active loans", color: "text-[var(--color-accent)]" },
            { label: "Total Outstanding", value: formatCurrency(totalOutstanding), sub: data.overdue_count > 0 ? `${data.overdue_count} overdue` : "On track", color: "text-[var(--color-error)]" },
          ].map((kpi) => (
            <div key={kpi.label} className="card p-4">
              <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wide mb-1">{kpi.label}</p>
              <p className={`text-[17px] font-bold ${kpi.color} leading-tight`}>{kpi.value}</p>
              <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Loan Type Donut */}
          <div className="card p-5">
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-4">
              Loan Portfolio
            </h2>
            {data.total_loans === 0 ? (
              <div className="text-center py-8 text-sm text-[var(--color-text-tertiary)]">No loans yet</div>
            ) : (
              <DonutChart data={donutData} total={data.total_loans} />
            )}
          </div>

          {/* Repayment Progress Rings */}
          <div className="card p-5">
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-4">
              Repayment Health
            </h2>
            <div className="flex flex-wrap justify-around gap-4">
              <ProgressRing value={repaymentPct} label="Repaid" color="#10b981" />
              <ProgressRing value={outstandingPct} label="Outstanding" color="#ef4444" />
              <ProgressRing
                value={data.total_loans > 0 ? (data.closed_loans / data.total_loans) * 100 : 0}
                label="Closed"
                color="#1a3a5c"
              />
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--color-border-light)] grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-[11px] text-[var(--color-text-tertiary)]">Active</p>
                <p className="text-lg font-bold text-[var(--color-text-primary)]">{data.active_loans}</p>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-[var(--color-text-tertiary)]">Closed</p>
                <p className="text-lg font-bold text-[var(--color-accent)]">{data.closed_loans}</p>
              </div>
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="card p-5">
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-4">
              6-Month Summary
            </h2>
            <div className="space-y-3 mb-4">
              {[
                { label: "Total Paid (6 mo)", value: formatCurrency(monthlyTotal) },
                { label: "Total Payments", value: monthlyCount.toString() },
                { label: "Avg Monthly", value: formatCurrency(avgMonthly) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-tertiary)]">{label}</span>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">{value}</span>
                </div>
              ))}
            </div>
            {data.upcoming_emi_date && (
              <div className="pt-3 border-t border-[var(--color-border-light)]">
                <p className="text-xs text-[var(--color-text-tertiary)] mb-1">Next EMI</p>
                <p className="text-sm font-semibold text-[var(--color-warning)]">{formatCurrency(data.upcoming_emi_amount)}</p>
                <p className="text-[11px] text-[var(--color-text-tertiary)]">Due {data.upcoming_emi_date}</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Payment Bar Chart */}
        {data.monthly_trend.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
                Monthly Payment Trend
              </h2>
              <span className="text-xs text-[var(--color-text-tertiary)]">Last {data.monthly_trend.length} months</span>
            </div>
            <BarChart data={data.monthly_trend} />
          </div>
        )}

        {/* Blockchain Readiness Card */}
        <div className="card p-5 border-[var(--color-primary)] border-opacity-30 bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary)] text-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white bg-opacity-15 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-[14px] font-bold text-white mb-1">Monad Blockchain Integration Active</h3>
              <p className="text-xs text-blue-200 leading-relaxed">
                Every payment receipt is SHA-256 hashed and anchored on the Monad Blockchain. 
                This creates immutable, tamper-proof proof of repayment that anyone can verify 
                publicly without compromising your privacy or relying on centralized servers.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-semibold">Tamper-Proof Anchoring Live</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
