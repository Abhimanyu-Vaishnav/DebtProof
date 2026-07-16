/**
 * DebtProof — Loan Detail Page
 * Full loan overview: stats, progress, payment history, receipts.
 */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LoanStatusBadge } from "@/components/loans/LoanStatusBadge";
import { PaymentCard } from "@/components/payments/PaymentCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { loansService } from "@/services/loans.service";
import { paymentsService } from "@/services/payments.service";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { LOAN_TYPE_LABELS, PAYMENT_METHOD_LABELS } from "@/types";
import type { Loan, Payment } from "@/types";

export default function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  const [loan, setLoan] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingLoan, setLoadingLoan] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [deletingPayment, setDeletingPayment] = useState(false);
  const [deleteLoanModal, setDeleteLoanModal] = useState(false);
  const [deletingLoan, setDeletingLoan] = useState(false);

  const fetchLoan = useCallback(async () => {
    try {
      const data = await loansService.getLoan(id);
      setLoan(data);
    } catch {
      showToast("Failed to load loan.", "error");
      router.push("/dashboard/loans");
    } finally {
      setLoadingLoan(false);
    }
  }, [id, router, showToast]);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await paymentsService.getLoanPayments(id, { page_size: 50, ordering: "-payment_date" });
      setPayments(res.results ?? []);
    } catch {
      // Non-fatal
    } finally {
      setLoadingPayments(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLoan();
    fetchPayments();
  }, [fetchLoan, fetchPayments, pathname]);

  const handleDeletePayment = async () => {
    if (!deletePaymentId) return;
    setDeletingPayment(true);
    try {
      await paymentsService.deletePayment(deletePaymentId);
      showToast("Payment deleted.", "success");
      setDeletePaymentId(null);
      fetchPayments();
      fetchLoan(); // Refresh outstanding balance
    } catch {
      showToast("Failed to delete payment.", "error");
    } finally {
      setDeletingPayment(false);
    }
  };

  const handleDeleteLoan = async () => {
    setDeletingLoan(true);
    try {
      await loansService.deleteLoan(id);
      showToast("Loan deleted.", "success");
      router.push("/dashboard/loans");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? "Failed to delete loan.";
      showToast(msg, "error");
    } finally {
      setDeletingLoan(false);
    }
  };

  if (loadingLoan) return <LoadingSpinner fullPage label="Loading loan details..." />;
  if (!loan) return null;

  const progress = loan.repayment_progress_percent;
  const outstanding = parseFloat(loan.outstanding_amount);
  const paid = parseFloat(loan.paid_amount);
  const principal = parseFloat(loan.principal_amount);

  return (
    <>
      <Topbar
        title={loan.name}
        subtitle={`${LOAN_TYPE_LABELS[loan.loan_type]} · ${loan.lender_name}`}
      />
      <main className="page-content space-y-5">
        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <LoanStatusBadge status={loan.status} overdue={loan.is_overdue} />
            {loan.account_number && (
              <span className="text-xs font-mono text-[var(--color-text-tertiary)] bg-[var(--color-surface-tertiary)] px-2 py-1 rounded-md">
                {loan.account_number}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/loans/${id}/payments/new`} className="btn btn-accent btn-sm">
              + Record Payment
            </Link>
            <Link href={`/dashboard/loans/${id}/edit`} className="btn btn-secondary btn-sm">
              Edit
            </Link>
            <button
              onClick={() => setDeleteLoanModal(true)}
              className="btn btn-ghost btn-sm text-[var(--color-error)]"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Principal", value: formatCurrency(principal) },
            { label: "Outstanding", value: formatCurrency(outstanding), highlight: true },
            { label: "Principal Paid", value: formatCurrency(paid) },
            { label: "Interest Paid", value: formatCurrency(loan.interest_paid) },
            { label: "Monthly EMI", value: formatCurrency(loan.monthly_emi) },
          ].map((stat) => (
            <div key={stat.label} className="card p-4">
              <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wide mb-1">{stat.label}</p>
              <p className={`text-[17px] font-bold ${stat.highlight ? "text-[var(--color-error)]" : "text-[var(--color-text-primary)]"}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)]">Repayment Progress</h2>
            <span className="text-lg font-bold text-[var(--color-text-primary)]">{Math.round(progress)}%</span>
          </div>
          <ProgressBar
            value={progress}
            size="lg"
            color={loan.is_overdue ? "error" : loan.status === "closed" ? "primary" : "accent"}
            animate
          />
          <div className="flex items-center justify-between mt-3 text-xs text-[var(--color-text-tertiary)]">
            <span>Start: {formatDate(loan.start_date)}</span>
            {loan.next_emi_date && (
              <span className={loan.is_overdue ? "text-[var(--color-error)] font-semibold" : ""}>
                Next EMI: {formatDate(loan.next_emi_date)}
                {loan.is_overdue && " (Overdue)"}
              </span>
            )}
            <span>End: {formatDate(loan.end_date)}</span>
          </div>
        </div>

        {/* Details & Payments row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Loan Info */}
          <div className="card p-5">
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-4">
              Loan Details
            </h2>
            <dl className="space-y-3">
              {[
                { label: "Type", value: LOAN_TYPE_LABELS[loan.loan_type] },
                { label: "Lender", value: loan.lender_name },
                { label: "Interest Rate", value: `${loan.interest_rate}% p.a.` },
                { label: "Start Date", value: formatDate(loan.start_date) },
                { label: "End Date", value: formatDate(loan.end_date) },
                { label: "Total Payments", value: `${loan.total_payments}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-2">
                  <dt className="text-xs text-[var(--color-text-tertiary)] shrink-0">{label}</dt>
                  <dd className="text-xs font-semibold text-[var(--color-text-primary)] text-right">{value}</dd>
                </div>
              ))}
            </dl>
            {loan.notes && (
              <div className="mt-4 pt-4 border-t border-[var(--color-border-light)]">
                <p className="text-xs text-[var(--color-text-tertiary)] mb-1">Notes</p>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{loan.notes}</p>
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="lg:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
                Payment History ({payments.length})
              </h2>
              <Link href={`/dashboard/loans/${id}/payments/new`} className="btn btn-accent btn-sm text-xs">
                + Record
              </Link>
            </div>
            {loadingPayments ? (
              <LoadingSpinner size="sm" label="Loading payments..." />
            ) : payments.length === 0 ? (
              <EmptyState
                title="No payments yet"
                description="Record your first EMI payment to start building proof."
                actionLabel="+ Record Payment"
                actionHref={`/dashboard/loans/${id}/payments/new`}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                }
              />
            ) : (
              <div>
                {payments.map((p) => (
                  <PaymentCard key={p.id} payment={p} onDelete={setDeletePaymentId} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Payment Modal */}
      <Modal
        isOpen={!!deletePaymentId}
        onClose={() => setDeletePaymentId(null)}
        title="Delete Payment"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeletePaymentId(null)} disabled={deletingPayment}>Cancel</button>
            <button className="btn bg-[var(--color-error)] text-white border-[var(--color-error)]" onClick={handleDeletePayment} disabled={deletingPayment}>
              {deletingPayment ? "Deleting..." : "Delete"}
            </button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-text-secondary)]">
          Delete this payment? The outstanding balance will be recalculated automatically.
        </p>
      </Modal>

      {/* Delete Loan Modal */}
      <Modal
        isOpen={deleteLoanModal}
        onClose={() => setDeleteLoanModal(false)}
        title="Delete Loan"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteLoanModal(false)} disabled={deletingLoan}>Cancel</button>
            <button className="btn bg-[var(--color-error)] text-white border-[var(--color-error)]" onClick={handleDeleteLoan} disabled={deletingLoan}>
              {deletingLoan ? "Deleting..." : "Delete Loan"}
            </button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-text-secondary)]">
          Are you sure you want to delete <strong>{loan.name}</strong>? Loans with payment records cannot be deleted.
        </p>
      </Modal>
    </>
  );
}
