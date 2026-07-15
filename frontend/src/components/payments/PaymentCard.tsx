/**
 * DebtProof — Payment Card Component
 */
import React from "react";
import { Payment, PAYMENT_METHOD_LABELS } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";

const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", className: "badge badge-success" },
  pending: { label: "Pending", className: "badge badge-warning" },
  failed: { label: "Failed", className: "badge badge-error" },
  refunded: { label: "Refunded", className: "badge badge-neutral" },
};

interface PaymentCardProps {
  payment: Payment;
  showLoan?: boolean;
  onDelete?: (id: string) => void;
}

export function PaymentCard({ payment, showLoan = false, onDelete }: PaymentCardProps) {
  const { label, className } = STATUS_CONFIG[payment.status] ?? {
    label: payment.status,
    className: "badge badge-neutral",
  };

  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-[var(--color-border-light)] last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-[var(--color-accent)] bg-opacity-10 flex items-center justify-center text-[var(--color-accent)] shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <div className="min-w-0">
          {showLoan && (
            <p className="text-xs font-medium text-[var(--color-primary)] truncate">{payment.loan_name}</p>
          )}
          <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">
            {formatCurrency(payment.amount)}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-[var(--color-text-tertiary)]">
              {formatDate(payment.payment_date)}
            </span>
            <span className="text-[10px] text-[var(--color-text-tertiary)]">·</span>
            <span className="text-xs text-[var(--color-text-tertiary)]">
              {PAYMENT_METHOD_LABELS[payment.payment_method]}
            </span>
            {payment.reference_number && (
              <>
                <span className="text-[10px] text-[var(--color-text-tertiary)]">·</span>
                <span className="text-xs text-[var(--color-text-tertiary)] font-mono truncate max-w-[120px]">
                  {payment.reference_number}
                </span>
              </>
            )}
          </div>
          {parseFloat(payment.principal_component) > 0 && parseFloat(payment.interest_component) > 0 && (
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
              Principal: <span className="font-semibold text-[var(--color-text-primary)]">
                {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(parseFloat(payment.principal_component))}
              </span>
              {" "}· Interest: <span className="font-semibold text-[var(--color-text-primary)]">
                {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(parseFloat(payment.interest_component))}
              </span>
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {payment.has_receipt && (
          <span title="Receipt uploaded" className="text-[var(--color-accent)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </span>
        )}
        <span className={className}>{label}</span>
        {onDelete && (
          <button
            onClick={() => onDelete(payment.id)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] hover:bg-red-50 transition-colors"
            aria-label="Delete payment"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
