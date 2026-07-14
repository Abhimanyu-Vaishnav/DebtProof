/**
 * DebtProof — Quick Actions Component
 * Grid of primary user actions for the dashboard.
 */
import React from "react";
import Link from "next/link";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  iconBg: string;
}

const actions: QuickAction[] = [
  {
    id: "add-loan",
    label: "Add Loan",
    description: "Track a new loan",
    href: "/dashboard/loans/new",
    iconBg: "bg-[var(--color-primary)]",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    id: "record-payment",
    label: "Record Payment",
    description: "Log a repayment",
    href: "/dashboard/payments/new",
    iconBg: "bg-[var(--color-accent)]",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
  {
    id: "upload-receipt",
    label: "Upload Receipt",
    description: "Hash & anchor proof",
    href: "/dashboard/receipts/upload",
    iconBg: "bg-[#7c3aed]",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
      </svg>
    ),
  },
  {
    id: "view-reports",
    label: "View Reports",
    description: "Repayment analytics",
    href: "/dashboard/reports",
    iconBg: "bg-[#0369a1]",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-heading">
      <h2
        id="quick-actions-heading"
        className="text-[13px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-3"
      >
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            id={`quick-action-${action.id}`}
            className="card p-4 flex flex-col gap-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
          >
            <div className={`w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center ${action.iconBg} group-hover:scale-110 transition-transform duration-200`}>
              {action.icon}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">
                {action.label}
              </p>
              <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
