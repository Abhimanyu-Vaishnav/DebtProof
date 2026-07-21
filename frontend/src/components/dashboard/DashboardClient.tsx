/**
 * DebtProof — Dashboard Client Component
 * Fetches and displays real data from the backend.
 */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { loansService } from "@/services/loans.service";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PaymentCard } from "@/components/payments/PaymentCard";
import { OverviewCard } from "@/components/dashboard/OverviewCard";
import { WalletCard } from "@/components/dashboard/WalletCard";
import type { DashboardData, LOAN_TYPE_LABELS } from "@/types";
import { LOAN_TYPE_LABELS as LABELS } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";

import { PayoffMilestonesWidget } from "@/components/analytics/PayoffMilestonesWidget";
import { AIDebtAdvisorWidget } from "@/components/dashboard/AIDebtAdvisorWidget";
import { CreditUtilizationMeter } from "@/components/credit-cards/CreditUtilizationMeter";
import { EmergencyBufferWidget } from "@/components/dashboard/EmergencyBufferWidget";
import { EMIBounceProtectionWidget } from "@/components/dashboard/EMIBounceProtectionWidget";
import { MultiCurrencyWidget } from "@/components/dashboard/MultiCurrencyWidget";

function formatDebtFreeDate(dateStr: string | null) {
  if (!dateStr) return "No active debts!";
  const [year, month] = dateStr.split("-");
  const dateObj = new Date(parseInt(year), parseInt(month) - 1);
  return dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const QUICK_ACTIONS = [
  {
    id: "add-loan",
    label: "Add Loan",
    description: "Track a new loan",
    href: "/dashboard/loans/new",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    bg: "bg-[var(--color-primary)]",
  },
  {
    id: "record-payment",
    label: "My Loans",
    description: "View all loans",
    href: "/dashboard/loans",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    bg: "bg-[var(--color-accent)]",
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "View insights",
    href: "/dashboard/analytics",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    bg: "bg-[#7c3aed]",
  },
  {
    id: "payments",
    label: "Payments",
    description: "Payment history",
    href: "/dashboard/payments",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    bg: "bg-[var(--color-info)]",
  },
];

export function DashboardClient() {
  const { format } = useCurrency();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loansService.getDashboard()
      .then(setData)
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-10 w-10 rounded-[var(--radius-md)] mb-3" />
              <div className="skeleton h-6 w-24 mb-2" />
              <div className="skeleton h-4 w-32" />
            </div>
          ))}
        </div>
        <LoadingSpinner size="md" label="Loading dashboard..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[var(--color-error)] mb-3">{error ?? "No data available."}</p>
        <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  const overviewCards = [
    {
      id: "total-loans",
      title: "Total Loans",
      value: data.total_loans.toString(),
      subtitle: `${data.active_loans} active · ${data.closed_loans} closed`,
      bg: "bg-[var(--color-primary)]",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      id: "outstanding",
      title: "Total Outstanding",
      value: format(data.total_outstanding),
      subtitle: `${format(data.total_paid_active)} principal · ${format(data.total_interest_paid)} interest`,
      bg: "bg-[var(--color-error)]",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    {
      id: "upcoming-emi",
      title: data.overdue_count > 0 ? "Overdue EMI" : "Upcoming EMI",
      value: data.upcoming_emi_amount > 0 ? format(data.upcoming_emi_amount) : "—",
      subtitle: data.upcoming_emi_date 
        ? `${data.overdue_count > 0 ? "Overdue since" : "Due"} ${formatDate(data.upcoming_emi_date)}` 
        : "No upcoming EMI",
      bg: data.overdue_count > 0 ? "bg-[var(--color-error)]" : "bg-[var(--color-warning)]",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {data.overdue_count > 0 ? (
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01" />
          ) : (
            <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>
          )}
        </svg>
      ),
    },
    {
      id: "loans-status",
      title: "Loans Status",
      value: `${data.active_loans} Active`,
      subtitle: `${data.closed_loans} closed · ${data.defaulted_loans} defaulted`,
      bg: "bg-[var(--color-accent)]",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-7">
      {/* Overview Cards */}
      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="sr-only">Financial Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {overviewCards.map((card) => (
            <OverviewCard
              key={card.id}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              icon={card.icon}
              iconBg={card.bg}
            />
          ))}
        </div>
      </section>

      {/* Overdue Banner */}
      {data.overdue_count > 0 && (
        <div className="bg-[var(--color-error)]/10 border-l-4 border-[var(--color-error)] p-4 rounded-r-[var(--radius-md)] flex items-start gap-3">
          <div className="mt-0.5 text-[var(--color-error)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-error)]">Action Required: Overdue Payments</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              You have {data.overdue_count} loan(s) with overdue EMI payments totaling {formatCurrency(data.upcoming_emi_amount)}. Please clear your dues to avoid penalties.
            </p>
            <Link href="/dashboard/loans" className="text-xs font-semibold text-[var(--color-error)] underline mt-2 inline-block">
              View My Loans
            </Link>
          </div>
        </div>
      )}

      {/* Debt Reduction Velocity & Milestones Widget */}
      <section aria-labelledby="milestones-heading">
        <h2 id="milestones-heading" className="sr-only">Payoff Milestones</h2>
        <PayoffMilestonesWidget data={data} />
      </section>

      {/* AI Debt Advisor & Credit Utilization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AIDebtAdvisorWidget data={data} />
        </div>
        <div>
          <CreditUtilizationMeter />
        </div>
      </div>

      {/* Emergency EMI Reserve Buffer Tracker */}
      <EmergencyBufferWidget data={data} />

      {/* EMI Auto-Debits Bank Account Health Checker */}
      <EMIBounceProtectionWidget data={data} />

      {/* Multi-Currency Tracker */}
      <MultiCurrencyWidget data={data} />

      {/* Quick Actions */}
      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="text-[13px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className="card p-4 hover:shadow-md transition-all hover:-translate-y-0.5 text-left group"
            >
              <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center text-white mb-3`}>
                {action.icon}
              </div>
              <p className="text-[13px] font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-light)] transition-colors">
                {action.label}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Projections & Simulations Section */}
      {data.active_loans > 0 && (
        <section aria-labelledby="projections-heading" className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Financial Freedom Widget */}
          <div className="card p-5 flex flex-col justify-between border-l-4 border-[var(--color-primary)] bg-gradient-to-r from-[var(--color-surface-secondary)] to-[var(--color-surface)]">
            <div>
              <div className="flex items-center gap-2 text-[var(--color-primary-light)] mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <h3 className="text-xs font-semibold uppercase tracking-wider">Financial Freedom</h3>
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)] font-medium">Projected Debt-Free Date</p>
              <h4 className="text-2xl font-bold text-[var(--color-text-primary)] mt-1 mb-3">
                {formatDebtFreeDate(data.projected_debt_free_date)}
              </h4>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Paying your current EMIs on time will make you debt-free in{" "}
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {data.simulations.baseline.months} months
                </span>.
              </p>
            </div>
            
            <div className="mt-5 pt-4 border-t border-[var(--color-border-light)] flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-semibold">Interest Burn Rate</p>
                <p className="text-lg font-bold text-[var(--color-error)] mt-0.5">
                  {formatCurrency(data.monthly_interest_burn)}
                  <span className="text-[10px] font-normal text-[var(--color-text-secondary)] ml-1">/mo</span>
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center text-[var(--color-error)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Payoff Strategy Simulator */}
          <div className="lg:col-span-2 card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-accent)]">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Payoff Accelerator Simulator
                  </h3>
                </div>
                <Link
                  href="/dashboard/repayment-simulator"
                  className="bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[10px] font-semibold py-0.5 px-2 rounded-full hover:bg-[var(--color-accent)]/20 transition-colors"
                >
                  Configure Simulator →
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Snowball Strategy */}
                <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] hover:border-[var(--color-primary-light)] transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">Debt Snowball</span>
                    <span className="text-[10px] text-[var(--color-text-tertiary)]">Lowest Balance First</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-[var(--color-text-secondary)]">
                      Debt-Free: <span className="font-semibold text-[var(--color-text-primary)]">{formatDebtFreeDate(data.simulations.snowball.debt_free_date)}</span>
                    </p>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">
                      Months Saved: <span className="font-semibold text-emerald-500">{data.simulations.snowball.months_saved} months</span>
                    </p>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">
                      Interest Saved: <span className="font-semibold text-emerald-500">{formatCurrency(data.simulations.snowball.interest_saved)}</span>
                    </p>
                  </div>
                </div>

                {/* Avalanche Strategy */}
                <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] hover:border-[var(--color-accent)] transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[var(--color-accent)] text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                    Recommended
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">Debt Avalanche</span>
                    <span className="text-[10px] text-[var(--color-text-tertiary)]">Highest Interest First</span>
                  </div>
                  <div className="space-y-1 animate-pulse-subtle">
                    <p className="text-[11px] text-[var(--color-text-secondary)]">
                      Debt-Free: <span className="font-semibold text-[var(--color-text-primary)]">{formatDebtFreeDate(data.simulations.avalanche.debt_free_date)}</span>
                    </p>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">
                      Months Saved: <span className="font-semibold text-emerald-500">{data.simulations.avalanche.months_saved} months</span>
                    </p>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">
                      Interest Saved: <span className="font-semibold text-emerald-500">{formatCurrency(data.simulations.avalanche.interest_saved)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-[var(--color-text-tertiary)] mt-4">
              * Calculations are estimates based on active loans and current interest rates. Extra payments are simulated at a baseline rate of {formatCurrency(5000)}/month.
            </p>
          </div>
        </section>
      )}

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Loan type distribution — mini chart */}
        <section className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
              Loan Portfolio
            </h2>
            <Link href="/dashboard/loans" className="text-xs text-[var(--color-primary-light)] hover:underline">
              View all →
            </Link>
          </div>
          <div className="card p-5 flex-1 flex flex-col justify-between">
            {data.total_loans === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-surface-tertiary)] flex items-center justify-center mx-auto mb-3 text-[var(--color-text-tertiary)]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">No loans yet</p>
                <p className="text-xs text-[var(--color-text-secondary)] mb-4">
                  Add your first loan to start tracking repayments.
                </p>
                <Link href="/dashboard/loans/new" className="btn btn-primary btn-sm">
                  + Add First Loan
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.type_distribution.map((item) => {
                  const pct = Math.round((item.count / data.total_loans) * 100);
                  return (
                    <div key={item.loan_type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-[var(--color-text-primary)]">
                          {LABELS[item.loan_type as keyof typeof LABELS] ?? item.loan_type}
                        </span>
                        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                          {item.count} loan{item.count !== 1 ? "s" : ""} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--color-surface-tertiary)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {/* Payment trend mini bars */}
                {data.monthly_trend.length > 0 && (
                  <div className="pt-4 mt-4 border-t border-[var(--color-border-light)]">
                    <p className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-widest mb-3">
                      Monthly Payments
                    </p>
                    <div className="flex items-end gap-1 h-16">
                      {(() => {
                        const max = Math.max(...data.monthly_trend.map((m) => m.total));
                        return data.monthly_trend.map((m) => (
                          <div key={m.month} className="flex-1 flex flex-col items-center gap-1" title={`${m.month}: ${formatCurrency(m.total)}`}>
                            <div
                              className="w-full rounded-t-sm bg-[var(--color-accent)] opacity-80 hover:opacity-100 transition-opacity"
                              style={{ height: `${max > 0 ? Math.max(4, (m.total / max) * 56) : 4}px` }}
                            />
                            <span className="text-[9px] text-[var(--color-text-tertiary)]">
                              {m.month.slice(5)}
                            </span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Wallet and Recent Payments stacked */}
        <div className="space-y-5">
          <WalletCard />

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
                Recent Payments
              </h2>
              <Link href="/dashboard/payments" className="text-xs text-[var(--color-primary-light)] hover:underline">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {data.recent_payments.length === 0 ? (
                <div className="card p-8 text-center">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-tertiary)] flex items-center justify-center mx-auto mb-3 text-[var(--color-text-tertiary)]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">No payments yet</p>
                </div>
              ) : (
                data.recent_payments.slice(0, 6).map((payment) => (
                  <PaymentCard key={payment.id} payment={payment} showLoan />
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
