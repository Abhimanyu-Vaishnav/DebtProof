/**
 * DebtProof — Loan Card Component
 */
import React, { useState } from "react";
import Link from "next/link";
import { Loan, LOAN_TYPE_LABELS } from "@/types";
import { formatDate, highlightMatch } from "@/utils/formatters";
import { useCurrency } from "@/contexts/CurrencyContext";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LoanStatusBadge } from "./LoanStatusBadge";
import { P2PContractModal } from "./P2PContractModal";
import { AmortizationScheduleModal } from "./AmortizationScheduleModal";
import { FinancialFreedomCertificateModal } from "./FinancialFreedomCertificateModal";

interface LoanCardProps {
  loan: Loan;
  onDelete?: (id: string) => void;
  searchQuery?: string;
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

export function LoanCard({ loan, onDelete, searchQuery = "" }: LoanCardProps) {
  const { format } = useCurrency();
  const progress = loan.repayment_progress_percent;
  const [showContractModal, setShowContractModal] = useState(false);
  const [showAmortizationModal, setShowAmortizationModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  return (
    <>
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
                {searchQuery ? highlightMatch(loan.name, searchQuery) : loan.name}
              </Link>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 truncate">
                {searchQuery ? highlightMatch(loan.lender_name, searchQuery) : loan.lender_name} · {LOAN_TYPE_LABELS[loan.loan_type]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {loan.is_p2p_agreement && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                P2P Contract
              </span>
            )}
            <LoanStatusBadge status={loan.status} overdue={loan.is_overdue} />
          </div>
        </div>

        {/* Financial row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide mb-0.5">
              Outstanding
            </p>
            <p className="text-[15px] font-bold text-[var(--color-text-primary)]">
              {format(loan.outstanding_amount)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide mb-0.5">
              EMI
            </p>
            <p className="text-[15px] font-bold text-[var(--color-text-primary)]">
              {format(loan.monthly_emi)}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-[var(--color-text-tertiary)] flex flex-col sm:flex-row sm:gap-2">
              <span>
                <strong className="text-[var(--color-text-primary)]">{format(loan.paid_amount)}</strong> paid
              </span>
              <span className="hidden sm:inline text-[var(--color-border)]">•</span>
              {loan.status === "active" ? (
                <span className={loan.is_overdue ? "text-[var(--color-error)] font-medium" : "text-blue-400 font-semibold"}>
                  {loan.is_overdue ? "Overdue" : "Upcoming"}: {format(loan.monthly_emi)}
                </span>
              ) : (
                <span>No active EMI</span>
              )}
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
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[var(--color-border-light)]">
          <div className="text-[11px] sm:text-xs text-[var(--color-text-tertiary)]">
            {loan.status === "active" ? (
              <>
                Next EMI:{" "}
                <span className={`font-medium ${loan.is_overdue ? "text-[var(--color-error)]" : "text-[var(--color-text-primary)]"}`}>
                  {formatDate(loan.next_emi_date || "2026-08-01")}
                </span>
              </>
            ) : (
              <span>Loan Closed / Inactive</span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {loan.is_p2p_agreement && (
              <button
                onClick={() => setShowContractModal(true)}
                className="btn btn-ghost btn-sm py-1 px-2 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-surface-tertiary)] flex items-center gap-1"
                title="View Digital Agreement & Promissory Contract"
              >
                📜 Note
              </button>
            )}
            {loan.status === "closed" && (
              <button
                onClick={() => setShowCertificateModal(true)}
                className="btn btn-ghost btn-sm py-1 px-2 text-xs font-bold text-amber-500 hover:bg-amber-50/10"
                title="View Financial Freedom Certificate"
              >
                🏆 Certificate
              </button>
            )}
            <button
              onClick={() => setShowAmortizationModal(true)}
              className="btn btn-ghost btn-sm py-1 px-2 text-xs font-semibold text-[var(--color-primary-light)] hover:bg-[var(--color-surface-secondary)]"
            >
              📊 Schedule
            </button>
            <Link
              href={`/dashboard/loans/${loan.id}`}
              className="btn btn-ghost btn-sm py-1 px-2 text-xs font-semibold"
            >
              View
            </Link>
            <Link
              href={`/dashboard/loans/${loan.id}/edit`}
              className="btn btn-ghost btn-sm py-1 px-2 text-xs font-semibold"
            >
              Edit
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(loan.id)}
                className="btn btn-ghost btn-sm py-1 px-2 text-xs font-semibold text-[var(--color-error)] hover:bg-red-50"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {showContractModal && (
        <P2PContractModal loan={loan} onClose={() => setShowContractModal(false)} />
      )}
      {showAmortizationModal && (
        <AmortizationScheduleModal loan={loan} onClose={() => setShowAmortizationModal(false)} />
      )}
      {showCertificateModal && (
        <FinancialFreedomCertificateModal loan={loan} onClose={() => setShowCertificateModal(false)} />
      )}
    </>
  );
}
