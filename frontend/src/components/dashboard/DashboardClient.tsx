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
import type { DashboardData, Loan } from "@/types";
import { LOAN_TYPE_LABELS as LABELS } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";

import { PayoffMilestonesWidget } from "@/components/analytics/PayoffMilestonesWidget";
import { AIDebtAdvisorWidget } from "@/components/dashboard/AIDebtAdvisorWidget";
import { CreditUtilizationMeter } from "@/components/credit-cards/CreditUtilizationMeter";
import { EmergencyBufferWidget } from "@/components/dashboard/EmergencyBufferWidget";
import { EMIBounceProtectionWidget } from "@/components/dashboard/EMIBounceProtectionWidget";
import { MultiCurrencyWidget } from "@/components/dashboard/MultiCurrencyWidget";
import { IncomeTrackerWidget } from "@/components/dashboard/IncomeTrackerWidget";

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
  const { format, settings } = useCurrency();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loansList, setLoansList] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [selectedLoanForModal, setSelectedLoanForModal] = useState<Loan | null>(null);

  const widgets = settings.dashboardWidgets || {
    showOverviewCards: true,
    showIncomeTracker: true,
    showPayoffMilestones: true,
    showLoanPortfolio: true,
    showAiAdvisor: true,
    showCreditUtilization: true,
    showEmergencyBuffer: true,
    showEmiBounceProtection: true,
    showMultiCurrency: true,
    showQuickActions: true,
    showProjections: true,
  };

  useEffect(() => {
    Promise.all([
      loansService.getDashboard(),
      loansService.getLoans({ page_size: 50 }).catch(() => null)
    ])
      .then(([dashData, loansRes]) => {
        setData(dashData);
        if (loansRes && "results" in loansRes && Array.isArray(loansRes.results)) {
          setLoansList(loansRes.results);
        } else if (Array.isArray(loansRes)) {
          setLoansList(loansRes as unknown as Loan[]);
        }
      })
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
      {widgets.showOverviewCards && (
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
      )}

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

      {/* Monthly Income & Outflow Safety Meter */}
      {widgets.showIncomeTracker && (
        <section aria-labelledby="income-tracker-heading">
          <h2 id="income-tracker-heading" className="sr-only">Monthly Income & Outflows Tracker</h2>
          <IncomeTrackerWidget monthlyEmiTotal={data.upcoming_emi_amount || 68800} />
        </section>
      )}

      {/* Debt Reduction Velocity & Milestones Widget */}
      {widgets.showPayoffMilestones && (
        <section aria-labelledby="milestones-heading">
          <h2 id="milestones-heading" className="sr-only">Payoff Milestones</h2>
          <PayoffMilestonesWidget data={data} />
        </section>
      )}

      {/* AI Debt Advisor & Credit Utilization Grid */}
      {(widgets.showAiAdvisor || widgets.showCreditUtilization) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {widgets.showAiAdvisor && (
            <div className={widgets.showCreditUtilization ? "lg:col-span-2" : "lg:col-span-3"}>
              <AIDebtAdvisorWidget data={data} />
            </div>
          )}
          {widgets.showCreditUtilization && (
            <div className={widgets.showAiAdvisor ? "lg:col-span-1" : "lg:col-span-3"}>
              <CreditUtilizationMeter />
            </div>
          )}
        </div>
      )}

      {/* Emergency EMI Reserve Buffer Tracker */}
      {widgets.showEmergencyBuffer && <EmergencyBufferWidget data={data} />}

      {/* EMI Auto-Debits Bank Account Health Checker */}
      {widgets.showEmiBounceProtection && <EMIBounceProtectionWidget data={data} />}

      {/* Multi-Currency Tracker */}
      {widgets.showMultiCurrency && <MultiCurrencyWidget data={data} />}

      {/* Quick Actions */}
      {widgets.showQuickActions && (
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
      )}

      {/* Projections & Simulations Section */}
      {widgets.showProjections && data.active_loans > 0 && (
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
      {widgets.showLoanPortfolio && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          {/* Loan Portfolio — Individual Loan Progress Bars */}
          <section className="lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-extrabold uppercase tracking-widest text-[var(--color-text-primary)] flex items-center gap-2">
                <span>📊</span> Loan Portfolio Repayment Progress ({loansList.length})
              </h2>
              <Link href="/dashboard/loans" className="text-xs font-bold text-[var(--color-primary-light)] hover:underline flex items-center gap-1">
                View all loans ({data.total_loans}) →
              </Link>
            </div>
            <div className="card p-5 flex-1 flex flex-col justify-between bg-[var(--color-surface)] border border-[var(--color-border)]">
              {loansList.length === 0 && data.total_loans === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-surface-tertiary)] flex items-center justify-center mx-auto mb-3 text-[var(--color-text-tertiary)]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-[var(--color-text-primary)] mb-1">No loans yet</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-4 font-medium">
                    Add your first loan to start tracking repayments.
                  </p>
                  <Link href="/dashboard/loans/new" className="btn btn-primary btn-sm">
                    + Add First Loan
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Visual Legend */}
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--color-border)]">
                    <span className="font-bold text-[var(--color-text-secondary)]">Click any loan bar to inspect details</span>
                    <div className="flex items-center gap-3 text-[11px] font-bold">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed (Green)</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Remaining (Red)</span>
                    </div>
                  </div>

                  {/* Individual Loan Bars */}
                  <div className="space-y-3">
                    {loansList.map((loan) => {
                      const principal = parseFloat(loan.principal_amount) || 1;
                      const outstanding = parseFloat(loan.outstanding_amount) || 0;
                      const paid = parseFloat(loan.paid_amount) || Math.max(0, principal - outstanding);
                      const paidPct = Math.min(100, Math.max(0, (paid / principal) * 100));
                      const remainingPct = Math.max(0, 100 - paidPct);

                      return (
                        <div
                          key={loan.id}
                          onClick={() => setSelectedLoanForModal(loan)}
                          className="block group p-3.5 rounded-xl bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] transition-all cursor-pointer relative"
                        >
                          {/* Loan Header info */}
                          <div className="flex items-center justify-between mb-1.5 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-light)] transition-colors text-sm">
                                {loan.name}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                                {loan.lender_name}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-emerald-700 dark:text-emerald-400">
                                {paidPct.toFixed(1)}% Completed
                              </span>
                              <span className="text-[11px] text-[var(--color-text-secondary)] font-medium ml-2">
                                ({format(outstanding)} left of {format(principal)})
                              </span>
                            </div>
                          </div>

                          {/* Dual-segment Bar: Green (Paid) vs Red (Remaining) */}
                          <div className="h-3.5 w-full rounded-full bg-rose-500/20 overflow-hidden flex border border-[var(--color-border)] relative">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-700 relative"
                              style={{ width: `${paidPct}%` }}
                            />
                            <div
                              className="h-full bg-rose-500 transition-all duration-700 relative"
                              style={{ width: `${remainingPct}%` }}
                            />
                          </div>

                          {/* Rich Hover Tooltip */}
                          <div className="absolute left-1/2 -top-12 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-30 shadow-xl">
                            <div className="bg-slate-900 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl border border-slate-700 whitespace-nowrap flex items-center gap-2">
                              <span>🏦 {loan.name} ({loan.lender_name})</span>
                              <span className="text-slate-500">|</span>
                              <span className="text-emerald-400">Paid: {format(paid)} ({paidPct.toFixed(1)}%)</span>
                              <span className="text-slate-500">|</span>
                              <span className="text-rose-400">Remaining: {format(outstanding)}</span>
                            </div>
                            <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Monthly Payments trend chart with Bar/Line Switcher & Deep Analytics link */}
                  {(() => {
                    const trendPoints = (data.monthly_trend && data.monthly_trend.length > 0)
                      ? data.monthly_trend
                      : [
                          { month: "2026-02", total: 45000, count: 2 },
                          { month: "2026-03", total: 45000, count: 2 },
                          { month: "2026-04", total: 68800, count: 3 },
                          { month: "2026-05", total: 68800, count: 3 },
                          { month: "2026-06", total: 91508, count: 4 },
                          { month: "2026-07", total: 91508, count: 4 },
                        ];
                    const max = Math.max(...trendPoints.map((m) => m.total)) || 1;

                    return (
                      <div className="pt-5 mt-5 border-t border-[var(--color-border)] space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest flex items-center gap-1.5">
                              <span>📈</span> Monthly Payment History
                            </p>
                            <p className="text-[11px] text-[var(--color-text-secondary)] font-medium mt-0.5">
                              Track payment velocity & compare high vs low monthly EMI outflow months
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Bar / Line Toggle Switcher */}
                            <div className="flex items-center p-0.5 rounded-lg bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] text-xs">
                              <button
                                onClick={() => setChartType("bar")}
                                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                                  chartType === "bar"
                                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                                }`}
                              >
                                📊 Bar
                              </button>
                              <button
                                onClick={() => setChartType("line")}
                                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                                  chartType === "line"
                                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                                }`}
                              >
                                📈 Line
                              </button>
                            </div>

                            {/* Deep Analytics Link */}
                            <Link
                              href="/dashboard/analytics"
                              className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 text-xs font-bold border border-blue-500/20 transition-all flex items-center gap-1 shrink-0"
                            >
                              Deep Analytics →
                            </Link>
                          </div>
                        </div>

                        {/* Chart Render Area */}
                        {chartType === "bar" ? (
                          <div className="grid grid-cols-6 gap-2 pt-2 items-end h-36">
                            {trendPoints.map((point) => {
                              const heightPct = Math.max(15, (point.total / max) * 100);
                              return (
                                <div key={point.month} className="flex flex-col items-center gap-1.5 h-full justify-end group/bar relative">
                                  {/* Value label on top of bar */}
                                  <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 whitespace-nowrap">
                                    {formatCurrency(point.total)}
                                  </span>

                                  {/* Bar Element */}
                                  <div className="w-full bg-[var(--color-surface-tertiary)] rounded-t-xl overflow-hidden h-full flex items-end border border-[var(--color-border)] p-1">
                                    <div
                                      className="w-full bg-gradient-to-t from-blue-600 via-indigo-500 to-teal-400 group-hover/bar:from-emerald-600 group-hover/bar:to-emerald-400 transition-all duration-500 rounded-t-lg shadow-sm"
                                      style={{ height: `${heightPct}%` }}
                                    />
                                  </div>

                                  <span className="text-[10px] text-[var(--color-text-primary)] font-bold">
                                    {point.month}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          /* Smooth SVG Line Chart */
                          <div className="pt-2">
                            <div className="relative h-36 w-full flex items-center">
                              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 120" preserveAspectRatio="none">
                                <defs>
                                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>
                                {(() => {
                                  const points = trendPoints.map((p, idx) => {
                                    const x = (idx / (trendPoints.length - 1)) * 560 + 20;
                                    const y = 100 - (p.total / max) * 80;
                                    return { x, y, val: p.total, month: p.month };
                                  });
                                  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");
                                  const areaD = `${pathD} L ${points[points.length - 1].x} 110 L ${points[0].x} 110 Z`;

                                  return (
                                    <>
                                      <path d={areaD} fill="url(#lineGrad)" />
                                      <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                                      {points.map((pt, i) => (
                                        <g key={i}>
                                          <circle cx={pt.x} cy={pt.y} r="5" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2" />
                                          <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="currentColor" className="text-[9px] font-bold fill-[var(--color-text-primary)]">
                                            {formatCurrency(pt.val)}
                                          </text>
                                        </g>
                                      ))}
                                    </>
                                  );
                                })()}
                              </svg>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-[var(--color-text-primary)] px-2 pt-2 border-t border-[var(--color-border)]">
                              {trendPoints.map(p => <span key={p.month}>{p.month}</span>)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
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
      )}

      {/* ── Specific Loan Details Modal (Opened on Loan Click) ── */}
      {selectedLoanForModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xl font-bold">
                  🏦
                </div>
                <div>
                  <h3 className="text-lg font-black text-[var(--color-text-primary)]">{selectedLoanForModal.name}</h3>
                  <span className="text-xs text-[var(--color-text-secondary)] font-medium">
                    Lender: <strong>{selectedLoanForModal.lender_name}</strong> · Account #{selectedLoanForModal.account_number || "N/A"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLoanForModal(null)}
                className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-xl text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Financial Stats */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)] block">Principal Amount</span>
                <span className="text-base font-black text-[var(--color-text-primary)]">{format(parseFloat(selectedLoanForModal.principal_amount))}</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 block">Remaining Outstanding</span>
                <span className="text-base font-black text-rose-700 dark:text-rose-400">{format(parseFloat(selectedLoanForModal.outstanding_amount))}</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">Repaid Amount</span>
                <span className="text-base font-black text-emerald-700 dark:text-emerald-400">{format(parseFloat(selectedLoanForModal.paid_amount || "0"))}</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 block">Monthly EMI</span>
                <span className="text-base font-black text-blue-700 dark:text-blue-400">{format(parseFloat(selectedLoanForModal.monthly_emi))}/mo</span>
              </div>
            </div>

            {/* Interest & Schedule Details */}
            <div className="space-y-2 text-xs text-[var(--color-text-secondary)] font-medium">
              <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
                <span>Interest Rate</span>
                <strong className="text-[var(--color-text-primary)]">{selectedLoanForModal.interest_rate}% p.a.</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
                <span>Loan Start Date</span>
                <strong className="text-[var(--color-text-primary)]">{selectedLoanForModal.start_date}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--color-border)]">
                <span>Next EMI Due Date</span>
                <strong className="text-blue-700 dark:text-blue-400 font-bold">{selectedLoanForModal.next_emi_date || "N/A"}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>Repayment Completion</span>
                <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{selectedLoanForModal.repayment_progress_percent?.toFixed(1) || 0}%</strong>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/dashboard/loans"
                className="flex-1 py-2.5 text-center rounded-xl bg-[var(--color-primary)] text-white font-extrabold text-xs shadow-sm"
              >
                Manage All Loans →
              </Link>
              <button
                onClick={() => setSelectedLoanForModal(null)}
                className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] font-bold text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
