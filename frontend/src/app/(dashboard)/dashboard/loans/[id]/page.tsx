/**
 * DebtProof — Loan Detail Page
 * Full loan overview: stats, progress, payment history, receipts.
 */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { LoanStatusBadge } from "@/components/loans/LoanStatusBadge";
import { PaymentCard } from "@/components/payments/PaymentCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { loansService } from "@/services/loans.service";
import { paymentsService } from "@/services/payments.service";
import { useWallet } from "@/hooks/useWallet";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { LOAN_TYPE_LABELS } from "@/types";
import type { Loan, Payment } from "@/types";
import { ForeclosureCalculatorModal } from "@/components/loans/ForeclosureCalculatorModal";

// ── EMI Repayment Progress Card ─────────────────────────────────
function LoanRepaymentCard({ loan, payments }: { loan: Loan; payments: Payment[] }) {
  const principal = parseFloat(loan.principal_amount) || 1;
  const paid = parseFloat(loan.paid_amount) || 0;
  const outstanding = parseFloat(loan.outstanding_amount) || 0;
  const interestPaid = parseFloat(loan.interest_paid) || 0;
  const progress = loan.repayment_progress_percent;

  // Ring chart
  const R = 54; const C = 2 * Math.PI * R;
  const dash = (Math.min(progress, 100) / 100) * C;

  // motivational messages
  const msg =
    progress >= 90 ? "🏆 Almost there! You're in the final stretch!" :
    progress >= 70 ? "🔥 Great momentum! Over 70% done!" :
    progress >= 50 ? "⚡ Halfway milestone reached! Keep going!" :
    progress >= 25 ? "💪 Solid start! 25%+ paid off!" :
    "🚀 Journey started. Every EMI brings you closer!";

  // Build monthly payment bars from payment history
  const monthlyMap = new Map<string, number>();
  payments.forEach(p => {
    const m = p.payment_date.slice(0, 7);
    monthlyMap.set(m, (monthlyMap.get(m) || 0) + parseFloat(p.amount));
  });
  const sortedMonths = Array.from(monthlyMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).slice(-8);
  const maxPayment = Math.max(...sortedMonths.map(([, v]) => v), 1);

  return (
    <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-5">
      {/* Top Row: Ring + Key Numbers */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Circular Ring */}
        <div className="relative shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
            <circle cx="70" cy="70" r={R} fill="none" stroke="var(--color-surface-tertiary)" strokeWidth="14" />
            <circle cx="70" cy="70" r={R} fill="none"
              stroke={loan.is_overdue ? "#f43f5e" : progress >= 100 ? "#10b981" : "var(--color-primary)"}
              strokeWidth="14"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-[var(--color-text-primary)]">{Math.round(progress)}%</span>
            <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Repaid</span>
          </div>
        </div>

        {/* Numbers */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 gap-3 w-full">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Principal Paid</p>
            <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-1">{formatCurrency(paid)}</p>
            <p className="text-[10px] font-medium text-emerald-700/70 dark:text-emerald-400/70 mt-0.5">{principal > 0 ? ((paid / principal) * 100).toFixed(1) : 0}% of principal</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <p className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">Still Outstanding</p>
            <p className="text-lg font-black text-rose-700 dark:text-rose-400 mt-1">{formatCurrency(outstanding)}</p>
            <p className="text-[10px] font-medium text-rose-700/70 dark:text-rose-400/70 mt-0.5">{loan.next_emi_date ? `Next EMI: ${formatDate(loan.next_emi_date)}` : "No upcoming EMI"}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">Interest Paid</p>
            <p className="text-lg font-black text-amber-700 dark:text-amber-400 mt-1">{formatCurrency(interestPaid)}</p>
            <p className="text-[10px] font-medium text-amber-700/70 dark:text-amber-400/70 mt-0.5">Cost of borrowing so far</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">Monthly EMI</p>
            <p className="text-lg font-black text-blue-700 dark:text-blue-400 mt-1">{formatCurrency(parseFloat(loan.monthly_emi))}</p>
            <p className="text-[10px] font-medium text-blue-700/70 dark:text-blue-400/70 mt-0.5">{loan.total_payments} payments made</p>
          </div>
        </div>
      </div>

      {/* Paid vs Remaining stacked bar */}
      <div>
        <div className="flex justify-between text-[11px] font-bold text-[var(--color-text-secondary)] mb-1.5">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Paid: {formatCurrency(paid)}</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Remaining: {formatCurrency(outstanding)}</span>
        </div>
        <div className="h-4 w-full rounded-full overflow-hidden flex bg-[var(--color-surface-tertiary)] border border-[var(--color-border)]">
          <div className="h-full bg-emerald-500 transition-all duration-700 rounded-l-full" style={{ width: `${Math.max(2, (paid / principal) * 100)}%` }} />
          <div className="h-full bg-rose-500/70 flex-1 rounded-r-full" />
        </div>
      </div>

      {/* Motivational message */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
        <span className="text-sm">{msg.split(' ')[0]}</span>
        <p className="text-xs font-bold text-[var(--color-text-primary)]">{msg.slice(msg.indexOf(' ') + 1)}</p>
      </div>

      {/* Payment history mini bar chart */}
      {sortedMonths.length > 0 && (
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Payment History (Last {sortedMonths.length} Months)</p>
          <div className="flex items-end gap-1.5 h-16">
            {sortedMonths.map(([month, val]) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                <div
                  className="w-full rounded-t-md bg-[var(--color-primary)] group-hover:bg-[var(--color-primary-light)] transition-colors"
                  style={{ height: `${Math.max(6, (val / maxPayment) * 100)}%` }}
                  title={`${month}: ${formatCurrency(val)}`}
                />
                <span className="text-[9px] font-bold text-[var(--color-text-secondary)]">{month.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="flex justify-between text-xs font-medium text-[var(--color-text-secondary)] pt-1 border-t border-[var(--color-border)]">
        <span>Started: {formatDate(loan.start_date)}</span>
        <span>Matures: {formatDate(loan.end_date)}</span>
      </div>
    </div>
  );
}

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
  const [showForeclosureModal, setShowForeclosureModal] = useState(false);
  
  const [escrowActionLoading, setEscrowActionLoading] = useState(false);
  const { walletAddress, connectWallet, withdrawEscrowPrincipal, repayEscrowLoan } = useWallet();

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

  const handleWithdrawEscrow = async () => {
    if (!walletAddress) {
      await connectWallet();
      return;
    }
    setEscrowActionLoading(true);
    try {
      const tx = await withdrawEscrowPrincipal(id);
      showToast(`Principal withdrawn! TX: ${tx}`, "success");
      // Could also update a backend status if we had one for withdrawn.
      // For now, let's just refresh loan to see any changes if we added logic.
      fetchLoan();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setEscrowActionLoading(false);
    }
  };

  const handleRepayEscrow = async () => {
    if (!walletAddress) {
      await connectWallet();
      return;
    }
    
    const amount = prompt("Enter amount of MON to repay:");
    if (!amount) return;

    setEscrowActionLoading(true);
    try {
      const tx = await repayEscrowLoan(id, amount);
      showToast(`Repayment successful! TX: ${tx}`, "success");
      // Create payment record on backend
      await paymentsService.createPayment(id, {
        amount: amount,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: "other",
        status: "confirmed",
        notes: `Web3 Escrow Repayment TX: ${tx}`,
        interest_component: "0",
        principal_component: amount
      });
      fetchPayments();
      fetchLoan();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setEscrowActionLoading(false);
    }
  };

  if (loadingLoan) return <LoadingSpinner fullPage label="Loading loan details..." />;
  if (!loan) return null;

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
            <button
              onClick={() => setShowForeclosureModal(true)}
              className="btn btn-secondary btn-sm font-bold flex items-center gap-1 text-xs"
            >
              ⚡ Foreclose / Part-Pay
            </button>
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

        {/* ── Beautiful Repayment Progress Card ── */}
        <LoanRepaymentCard loan={loan} payments={payments} />

        {/* Escrow Actions */}
        {loan.is_escrow && (
          <div className="card p-5 bg-[var(--color-surface-secondary)] border-[var(--color-accent)] border-l-4">
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[var(--color-accent)] mb-4">
              Web3 Escrow Actions
            </h2>
            <div className="flex flex-col gap-3">
              {!loan.lender_wallet ? (
                <div className="text-sm text-[var(--color-text-secondary)] p-3 bg-[var(--color-surface-tertiary)] rounded-[var(--radius-md)] border border-[var(--color-border)]">
                  This loan is currently listed on the P2P Marketplace. Waiting for a lender to fund it.
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handleWithdrawEscrow}
                    disabled={escrowActionLoading}
                    className="btn btn-primary flex-1"
                  >
                    {escrowActionLoading ? "Processing..." : "Withdraw Principal"}
                  </button>
                  <button 
                    onClick={handleRepayEscrow}
                    disabled={escrowActionLoading}
                    className="btn btn-secondary flex-1"
                  >
                    {escrowActionLoading ? "Processing..." : "Repay via Web3"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

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

      {/* Foreclosure / Part-Pay Calculator Modal */}
      {showForeclosureModal && (
        <ForeclosureCalculatorModal
          loan={loan}
          onClose={() => setShowForeclosureModal(false)}
        />
      )}
    </>
  );
}
