/**
 * DebtProof — Loan Card Component
 */
import React from "react";
import Link from "next/link";
import { Loan, LOAN_TYPE_LABELS } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LoanStatusBadge } from "./LoanStatusBadge";

interface LoanCardProps {
  loan: Loan;
  onDelete?: (id: string) => void;
}

const LOAN_TYPE_ICONS: Record<string, string> = {
  home: "🏠",
  personal: "👤",
  vehicle: "🚗",
  education: "🎓",
  business: "💼",
  credit_card: "💳",
  other: "📄",
};

export function LoanCard({ loan, onDelete }: LoanCardProps) {
  const progress = loan.repayment_progress_percent;

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-tertiary)] flex items-center justify-center text-lg shrink-0">
            {LOAN_TYPE_ICONS[loan.loan_type] ?? "📄"}
          </div>
          <div className="min-w-0">
            <Link
              href={`/dashboard/loans/${loan.id}`}
              className="text-[14px] font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary-light)] transition-colors truncate block"
            >
              {loan.name}
            </Link>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 truncate">
              {loan.lender_name} · {LOAN_TYPE_LABELS[loan.loan_type]}
            </p>
          </div>
        </div>
        <LoanStatusBadge status={loan.status} overdue={loan.is_overdue} />
      </div>

      {/* Financial row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide mb-0.5">
            Outstanding
          </p>
          <p className="text-[15px] font-bold text-[var(--color-text-primary)]">
            {formatCurrency(loan.outstanding_amount)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide mb-0.5">
            EMI
          </p>
          <p className="text-[15px] font-bold text-[var(--color-text-primary)]">
            {formatCurrency(loan.monthly_emi)}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[var(--color-text-tertiary)]">
            {formatCurrency(loan.paid_amount)} paid
          </span>
          <span className="text-xs font-semibold text-[var(--color-text-primary)]">
            {Math.round(progress)}%
          </span>
        </div>
        <ProgressBar
          value={progress}
          size="sm"
          color={loan.is_overdue ? "error" : loan.status === "closed" ? "primary" : "accent"}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-light)]">
        <div className="text-xs text-[var(--color-text-tertiary)]">
          {loan.next_emi_date ? (
            <>
              Next EMI:{" "}
              <span className={`font-medium ${loan.is_overdue ? "text-[var(--color-error)]" : "text-[var(--color-text-primary)]"}`}>
                {formatDate(loan.next_emi_date)}
              </span>
            </>
          ) : (
            <span>No upcoming EMI</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={`/dashboard/loans/${loan.id}`}
            className="btn btn-ghost btn-sm py-1 px-2 text-xs"
          >
            View
          </Link>
          <Link
            href={`/dashboard/loans/${loan.id}/edit`}
            className="btn btn-ghost btn-sm py-1 px-2 text-xs"
          >
            Edit
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(loan.id)}
              className="btn btn-ghost btn-sm py-1 px-2 text-xs text-[var(--color-error)] hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
