/**
 * DebtProof — Main Dashboard Page
 * Overview: stats, quick actions, loan placeholder, recent payments.
 */
import type { Metadata } from "next";
import { Topbar } from "@/components/layout/Topbar";
import { OverviewCard } from "@/components/dashboard/OverviewCard";
import { LoanPlaceholder } from "@/components/dashboard/LoanPlaceholder";
import { RecentPaymentsPlaceholder } from "@/components/dashboard/RecentPaymentsPlaceholder";
import { QuickActions } from "@/components/dashboard/QuickActions";

export const metadata: Metadata = { title: "Overview" };

// ── Mock stats for skeleton UI ────────────────────────────────
const OVERVIEW_CARDS = [
  {
    id: "total-loans",
    title: "Total Loans",
    value: "—",
    subtitle: "Active + closed",
    iconBg: "bg-[var(--color-primary)]",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: "outstanding",
    title: "Total Outstanding",
    value: "—",
    subtitle: "Across all active loans",
    iconBg: "bg-[var(--color-error)]",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    id: "upcoming-emi",
    title: "Upcoming EMI",
    value: "—",
    subtitle: "No upcoming EMI",
    iconBg: "bg-[var(--color-warning)]",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "loans-closed",
    title: "Loans Closed",
    value: "—",
    subtitle: "Successfully repaid",
    iconBg: "bg-[var(--color-accent)]",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  return (
    <>
      <Topbar
        title="Overview"
        subtitle="Your financial snapshot"
      />
      <main className="page-content space-y-7">
        {/* Overview Cards Grid */}
        <section aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="sr-only">
            Financial Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {OVERVIEW_CARDS.map((card) => (
              <OverviewCard key={card.id} {...card} />
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <QuickActions />

        {/* Bottom Row: Loans + Recent Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Loans Section — 2/3 width */}
          <section className="lg:col-span-2" aria-labelledby="loans-section-heading">
            <div className="flex items-center justify-between mb-3">
              <h2 id="loans-section-heading" className="text-[13px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
                My Loans
              </h2>
            </div>
            <LoanPlaceholder />
          </section>

          {/* Recent Payments — 1/3 width */}
          <section aria-labelledby="payments-section-heading">
            <div className="flex items-center justify-between mb-3">
              <h2 id="payments-section-heading" className="text-[13px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
                Recent Payments
              </h2>
            </div>
            <RecentPaymentsPlaceholder />
          </section>
        </div>
      </main>
    </>
  );
}
