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
import type { DashboardData, LOAN_TYPE_LABELS } from "@/types";
import { LOAN_TYPE_LABELS as LABELS } from "@/types";

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
      value: formatCurrency(data.total_outstanding),
      subtitle: `${formatCurrency(data.total_paid_active)} principal · ${formatCurrency(data.total_interest_paid)} interest`,
      bg: "bg-[var(--color-error)]",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    {
      id: "upcoming-emi",
      title: "Upcoming EMI",
      value: data.upcoming_emi_amount > 0 ? formatCurrency(data.upcoming_emi_amount) : "—",
      subtitle: data.upcoming_emi_date ? `Due ${formatDate(data.upcoming_emi_date)}` : "No upcoming EMI",
      bg: "bg-[var(--color-warning)]",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: "loans-closed",
      title: "Loans Closed",
      value: data.closed_loans.toString(),
      subtitle: data.overdue_count > 0 ? `${data.overdue_count} overdue` : "All on track",
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
            <div key={card.id} className="overview-card">
              <div className="flex items-start justify-between mb-3">
                <div className={`overview-card-icon ${card.bg} text-white`}>{card.icon}</div>
              </div>
              <p className="text-xl font-bold text-[var(--color-text-primary)] mb-0.5">{card.value}</p>
              <p className="text-[13px] font-medium text-[var(--color-text-primary)]">{card.title}</p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{card.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

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

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Loan type distribution — mini chart */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
              Loan Portfolio
            </h2>
            <Link href="/dashboard/loans" className="text-xs text-[var(--color-primary-light)] hover:underline">
              View all →
            </Link>
          </div>
          <div className="card p-5">
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

        {/* Recent Payments */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
              Recent Payments
            </h2>
            <Link href="/dashboard/payments" className="text-xs text-[var(--color-primary-light)] hover:underline">
              View all →
            </Link>
          </div>
          <div className="card p-4">
            {data.recent_payments.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-tertiary)] flex items-center justify-center mx-auto mb-3 text-[var(--color-text-tertiary)]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">No payments yet</p>
              </div>
            ) : (
              <div>
                {data.recent_payments.slice(0, 6).map((payment) => (
                  <PaymentCard key={payment.id} payment={payment} showLoan />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
