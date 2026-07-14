/**
 * DebtProof — Recent Payments Placeholder
 * Shown until the user records their first payment.
 */
import React from "react";

export function RecentPaymentsPlaceholder() {
  return (
    <section
      className="card p-6 flex flex-col items-center justify-center text-center min-h-[180px]"
      aria-label="No payments recorded yet"
    >
      <div className="w-12 h-12 rounded-2xl bg-[var(--color-surface-secondary)] flex items-center justify-center mb-3.5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      </div>
      <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-1.5">
        No payments yet
      </h3>
      <p className="text-xs text-[var(--color-text-secondary)] max-w-[240px] leading-relaxed">
        Your recent repayments will appear here once you start recording them.
      </p>
    </section>
  );
}
