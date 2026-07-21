/**
 * DebtProof — Analytics Page (Redesigned)
 * Clean, modern, theme-aware financial analytics dashboard.
 */
"use client";

import React, { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { loansService } from "@/services/loans.service";
import { LOAN_TYPE_LABELS } from "@/types";
import type { DashboardData } from "@/types";
import { TaxSavingsCalculator } from "@/components/analytics/TaxSavingsCalculator";
import { RefinancingCalculatorModal } from "@/components/analytics/RefinancingCalculatorModal";
import { DebtBattleSimulator } from "@/components/analytics/DebtBattleSimulator";
import { ModernMultiMetricChartStudio } from "@/components/analytics/ModernMultiMetricChartStudio";
import { useCurrency } from "@/contexts/CurrencyContext";

const DONUT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#f43f5e", "#14b8a6", "#a855f7"];

// ── Compact Donut Chart ──────────────────────────────────────────
function DonutChart({ data, total }: { data: { label: string; count: number; color: string }[]; total: number }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const R = 52; const STROKE = 18; const C = 2 * Math.PI * R;
  let offset = 0;
  const segs = data.map(item => {
    const pct = total > 0 ? item.count / total : 0;
    const dash = pct * C;
    const so = C - offset;
    offset += dash;
    return { ...item, dash, gap: C - dash, startOffset: so };
  });

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <svg width="130" height="130" viewBox="0 0 130 130" className="-rotate-90">
          <circle cx="65" cy="65" r={R} fill="none" stroke="var(--color-surface-tertiary)" strokeWidth={STROKE} />
          {segs.map(s => (
            <circle key={s.label} cx="65" cy="65" r={R} fill="none"
              stroke={s.color} strokeWidth={hovered === s.label ? STROKE + 3 : STROKE}
              strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={s.startOffset}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHovered(s.label)} onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-[var(--color-text-primary)]">{total}</span>
          <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest">Loans</span>
        </div>
      </div>
      <div className="flex-1 space-y-2 w-full">
        {segs.map(s => (
          <div key={s.label}
            onMouseEnter={() => setHovered(s.label)} onMouseLeave={() => setHovered(null)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${hovered === s.label ? "bg-[var(--color-surface-tertiary)]" : "hover:bg-[var(--color-surface-secondary)]"}`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-sm font-medium text-[var(--color-text-primary)]">{s.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--color-text-secondary)]">{total > 0 ? ((s.count / total) * 100).toFixed(0) : 0}%</span>
              <span className="text-sm font-black text-[var(--color-text-primary)] bg-[var(--color-surface-tertiary)] px-2 py-0.5 rounded-md">{s.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Progress Ring (compact) ─────────────────────────────────────
function Ring({ value, label, color, sub }: { value: number; label: string; color: string; sub?: string }) {
  const R = 26; const C = 2 * Math.PI * R;
  const dash = (Math.min(value, 100) / 100) * C;
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
      <div className="relative shrink-0">
        <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
          <circle cx="32" cy="32" r={R} fill="none" stroke="var(--color-surface-tertiary)" strokeWidth="9" />
          <circle cx="32" cy="32" r={R} fill="none" stroke={color} strokeWidth="9"
            strokeDasharray={`${dash} ${C - dash}`} strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black text-[var(--color-text-primary)]">{Math.round(value)}%</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-[var(--color-text-primary)]">{label}</p>
        {sub && <p className="text-xs text-[var(--color-text-secondary)] font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── KPI Card ────────────────────────────────────────────────────
function KPICard({ icon, label, value, sub, accent }: { icon: string; label: string; value: string; sub: string; accent: string }) {
  return (
    <div className="card p-5 border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={`text-2xl font-black ${accent} leading-none`}>{value}</p>
      <p className="text-xs font-medium text-[var(--color-text-secondary)]">{sub}</p>
    </div>
  );
}

// ── Section Header ──────────────────────────────────────────────
function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h2 className="text-[13px] font-black uppercase tracking-widest text-[var(--color-text-primary)]">{title}</h2>
        {subtitle && <p className="text-xs font-medium text-[var(--color-text-secondary)] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Main Analytics Page ─────────────────────────────────────────
export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRefinance, setShowRefinance] = useState(false);
  const { format } = useCurrency();

  useEffect(() => {
    loansService.getDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <>
      <Topbar title="Analytics" subtitle="Financial intelligence at a glance" />
      <main className="page-content"><LoadingSpinner fullPage label="Loading analytics…" /></main>
    </>
  );

  if (!data) return (
    <>
      <Topbar title="Analytics" subtitle="Financial intelligence at a glance" />
      <main className="page-content">
        <div className="card p-10 text-center text-sm text-[var(--color-text-secondary)]">No data available.</div>
      </main>
    </>
  );

  // Computed values
  const totalPrincipal = data.total_principal_active || 1;
  const totalOutstanding = data.total_outstanding || 0;
  const totalPaid = data.total_paid_active || 0;
  const totalInterestPaid = data.total_interest_paid || 0;
  const repaidPct = (totalPaid / totalPrincipal) * 100;
  const outstandingPct = (totalOutstanding / totalPrincipal) * 100;
  const closedPct = data.total_loans > 0 ? (data.closed_loans / data.total_loans) * 100 : 0;
  const monthlyTotal = data.monthly_trend.reduce((s, m) => s + m.total, 0);
  const avgMonthly = data.monthly_trend.length > 0 ? monthlyTotal / data.monthly_trend.length : 0;
  const monthlyInterestBurn = data.monthly_interest_burn || 0;

  const donutData = data.type_distribution.map((item, i) => ({
    label: LOAN_TYPE_LABELS[item.loan_type as keyof typeof LOAN_TYPE_LABELS] ?? item.loan_type,
    count: item.count,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));

  // Monthly trend for the mini bar chart
  const trend = data.monthly_trend.length > 0
    ? data.monthly_trend
    : Array.from({ length: 6 }, (_, i) => ({ month: `Month ${i + 1}`, total: 45000 + i * 10000, count: 2 + i }));
  const maxTrend = Math.max(...trend.map(t => t.total)) || 1;

  return (
    <>
      <Topbar title="Analytics" subtitle="Financial intelligence at a glance" />

      <main className="page-content space-y-8">

        {/* ── TOP KPI STRIP ────────────────────────────────── */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPICard icon="📋" label="Total Loans" value={data.total_loans.toString()}
              sub={`${data.active_loans} active · ${data.closed_loans} closed`}
              accent="text-[var(--color-primary-light)]" />
            <KPICard icon="💸" label="Total Borrowed" value={format(data.total_principal_all)}
              sub="All-time principal across all loans"
              accent="text-[var(--color-text-primary)]" />
            <KPICard icon="✅" label="Total Repaid" value={format(totalPaid)}
              sub="Principal cleared on active loans"
              accent="text-emerald-600 dark:text-emerald-400" />
            <KPICard icon="🔴" label="Outstanding" value={format(totalOutstanding)}
              sub={data.overdue_count > 0 ? `⚠️ ${data.overdue_count} overdue` : "On track"}
              accent={data.overdue_count > 0 ? "text-rose-600 dark:text-rose-400" : "text-blue-600 dark:text-blue-400"} />
          </div>
        </section>

        {/* ── PORTFOLIO + HEALTH + TREND ───────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Loan Portfolio Donut */}
          <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)]">
            <SectionHeader title="Loan Portfolio" subtitle="Breakdown by loan category" />
            {data.total_loans === 0
              ? <div className="py-12 text-center text-sm text-[var(--color-text-secondary)]">No loans yet</div>
              : <DonutChart data={donutData} total={data.total_loans} />
            }
          </div>

          {/* Repayment Health Rings */}
          <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)]">
            <SectionHeader title="Repayment Health" subtitle="Your debt reduction progress" />
            <div className="space-y-3">
              <Ring value={repaidPct} label="Principal Repaid" color="#10b981" sub={format(totalPaid)} />
              <Ring value={outstandingPct} label="Still Outstanding" color="#f43f5e" sub={format(totalOutstanding)} />
              <Ring value={closedPct} label="Loans Fully Closed" color="#3b82f6" sub={`${data.closed_loans} of ${data.total_loans} loans`} />
            </div>
          </div>

          {/* 6-Month Payments Bar Chart */}
          <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)]">
            <SectionHeader
              title="Payment History"
              subtitle="Monthly EMI outflows"
              action={
                <span className="text-[11px] font-bold text-[var(--color-text-secondary)] bg-[var(--color-surface-secondary)] px-2 py-1 rounded-md border border-[var(--color-border)]">
                  Avg {format(avgMonthly)}/mo
                </span>
              }
            />
            <div className="flex items-end gap-2 h-36 mt-2">
              {trend.slice(-6).map((p, i) => {
                const h = Math.max(12, (p.total / maxTrend) * 100);
                return (
                  <div key={p.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[9px] font-black text-[var(--color-primary-light)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {format(p.total)}
                    </span>
                    <div
                      className="w-full rounded-t-lg bg-[var(--color-primary)] group-hover:bg-[var(--color-primary-light)] transition-colors"
                      style={{ height: `${h}%` }}
                      title={`${p.month}: ${format(p.total)}`}
                    />
                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)]">
                      {p.month.slice(-2)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--color-border)] grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">6M Total</p>
                <p className="text-base font-black text-[var(--color-text-primary)] mt-0.5">{format(monthlyTotal)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Next EMI</p>
                <p className="text-base font-black text-[var(--color-text-primary)] mt-0.5">
                  {data.upcoming_emi_amount > 0 ? format(data.upcoming_emi_amount) : "—"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── INTEREST COST BREAKDOWN ──────────────────────── */}
        <section>
          <SectionHeader title="Interest Cost Analysis" subtitle="Where your money really goes every month" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-5 border border-[var(--color-border)] bg-[var(--color-surface)]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Monthly Interest Burn</p>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">{format(monthlyInterestBurn)}<span className="text-sm font-normal text-[var(--color-text-secondary)] ml-1">/mo</span></p>
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mt-2">This money goes to banks, not your principal</p>
            </div>
            <div className="card p-5 border border-[var(--color-border)] bg-[var(--color-surface)]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Total Interest Paid (Lifetime)</p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">{format(totalInterestPaid)}</p>
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mt-2">Cumulative cost of borrowing since start</p>
            </div>
            <div className="card p-5 border border-[var(--color-border)] bg-[var(--color-surface)]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Debt-Free Projection</p>
              <p className="text-2xl font-black text-[var(--color-primary-light)] mt-2">
                {data.simulations?.baseline?.months ? `${data.simulations.baseline.months} mo` : "—"}
              </p>
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mt-2">
                {data.simulations?.baseline?.debt_free_date
                  ? `Est. clear by ${new Date(data.simulations.baseline.debt_free_date).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`
                  : "Keep up with EMIs"}
              </p>
            </div>
          </div>

          {/* Principal vs Interest Visual Split */}
          <div className="card p-5 border border-[var(--color-border)] bg-[var(--color-surface)] mt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-primary)]">Principal vs Interest — Your Repayment Breakdown</p>
              <div className="flex items-center gap-4 text-[11px] font-bold text-[var(--color-text-secondary)]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Principal</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Interest</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--color-surface-tertiary)] inline-block border border-[var(--color-border)]" /> Remaining</span>
              </div>
            </div>
            {(() => {
              const total = data.total_principal_all || 1;
              const principalPct = (totalPaid / total) * 100;
              const interestPct = (totalInterestPaid / total) * 100;
              const remainingPct = Math.max(0, 100 - principalPct - interestPct);
              return (
                <div className="space-y-1.5">
                  <div className="h-5 w-full rounded-full overflow-hidden flex bg-[var(--color-surface-tertiary)] border border-[var(--color-border)]">
                    <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${principalPct}%` }} title={`Principal: ${format(totalPaid)}`} />
                    <div className="h-full bg-amber-500 transition-all duration-700" style={{ width: `${interestPct}%` }} title={`Interest: ${format(totalInterestPaid)}`} />
                    <div className="h-full bg-[var(--color-primary)]/30" style={{ width: `${remainingPct}%` }} title={`Outstanding: ${format(totalOutstanding)}`} />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-[var(--color-text-secondary)]">
                    <span>Principal cleared: {principalPct.toFixed(1)}% · {format(totalPaid)}</span>
                    <span>Remaining: {format(totalOutstanding)}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* ── PAYOFF STRATEGY COMPARISON ───────────────────── */}
        {data.active_loans > 0 && data.simulations && (
          <section>
            <SectionHeader
              title="Payoff Strategy Optimizer"
              subtitle="Snowball vs Avalanche — See the better path to debt freedom"
              action={
                <button onClick={() => setShowRefinance(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold shadow-sm hover:opacity-90 transition cursor-pointer">
                  🔄 Refinance Calculator
                </button>
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: "❄️ Debt Snowball", tag: "Lowest balance first", color: "border-blue-500/40",
                  items: [
                    { key: "Debt-Free By", val: data.simulations.snowball.debt_free_date ? new Date(data.simulations.snowball.debt_free_date).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—" },
                    { key: "Months Saved", val: `${data.simulations.snowball.months_saved} months` },
                    { key: "Interest Saved", val: format(data.simulations.snowball.interest_saved) },
                  ],
                  accentClass: "text-blue-600 dark:text-blue-400",
                },
                {
                  name: "🏔️ Debt Avalanche", tag: "Highest interest first — Most efficient", color: "border-emerald-500/50",
                  badge: "Recommended",
                  items: [
                    { key: "Debt-Free By", val: data.simulations.avalanche.debt_free_date ? new Date(data.simulations.avalanche.debt_free_date).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—" },
                    { key: "Months Saved", val: `${data.simulations.avalanche.months_saved} months` },
                    { key: "Interest Saved", val: format(data.simulations.avalanche.interest_saved) },
                  ],
                  accentClass: "text-emerald-600 dark:text-emerald-400",
                },
              ].map(s => (
                <div key={s.name} className={`card p-6 border-2 ${s.color} bg-[var(--color-surface)] relative`}>
                  {s.badge && (
                    <span className="absolute top-0 right-0 mt-0 mr-0 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">
                      {s.badge}
                    </span>
                  )}
                  <p className="text-sm font-black text-[var(--color-text-primary)]">{s.name}</p>
                  <p className="text-[11px] font-medium text-[var(--color-text-secondary)] mt-0.5 mb-4">{s.tag}</p>
                  <div className="space-y-2.5">
                    {s.items.map(item => (
                      <div key={item.key} className="flex justify-between items-center py-1.5 border-b border-[var(--color-border)] last:border-0">
                        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">{item.key}</span>
                        <span className={`text-sm font-black ${s.accentClass}`}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)] font-medium mt-3 px-1">
              * Simulations assume an extra ₹5,000/month payment. Adjust in the Repayment Simulator.
            </p>
          </section>
        )}

        {/* ── INTERACTIVE MULTI-METRIC CHART STUDIO ────────── */}
        <section>
          <SectionHeader
            title="Interactive Analytics Studio"
            subtitle="Select any metric to chart — or overlay two datasets for comparative analysis"
          />
          <ModernMultiMetricChartStudio data={data} />
        </section>

        {/* ── TOOLS SECTION ────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Tax Savings Calculator */}
          <div>
            <SectionHeader title="Tax Savings Calculator" subtitle="Section 80C / 24(b) deductions on loan interest" />
            <TaxSavingsCalculator />
          </div>

          {/* Debt Battle Simulator */}
          <div>
            <SectionHeader title="Debt Battle Simulator" subtitle="Battle your loans to freedom — scenario planning tool" />
            <DebtBattleSimulator data={data} />
          </div>
        </section>

      </main>

      {showRefinance && (
        <RefinancingCalculatorModal
          currentOutstanding={totalOutstanding}
          onClose={() => setShowRefinance(false)}
        />
      )}
    </>
  );
}
