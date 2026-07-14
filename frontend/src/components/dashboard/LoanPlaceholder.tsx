/**
 * DebtProof — Loan Placeholder Component
 * Shown on dashboard until real loans are added.
 */
import React from "react";
import Link from "next/link";

export function LoanPlaceholder() {
  return (
    <section
      className="card p-6 flex flex-col items-center justify-center text-center min-h-[200px]"
      aria-label="No loans added yet"
    >
      <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-secondary)] flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </div>
      <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] mb-1.5">
        No loans yet
      </h3>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-xs leading-relaxed mb-4">
        Add your first loan to start tracking repayments and generating 
        immutable proof of every payment.
      </p>
      <Link
        href="/dashboard/loans/new"
        className="btn btn-primary btn-sm"
        id="add-first-loan-btn"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add First Loan
      </Link>
    </section>
  );
}
