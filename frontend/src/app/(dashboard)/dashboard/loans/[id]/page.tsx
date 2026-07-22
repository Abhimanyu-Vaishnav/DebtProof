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

// ── EMI Repayment Progress Card & Live Calculations ─────────────────────────────────
function LoanRepaymentCard({ loan, payments }: { loan: Loan; payments: Payment[] }) {
  const principal = parseFloat(loan.principal_amount) || 1;
  
  // Calculate dynamic totals from recorded payments
  const totalPaymentsAmount = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const calculatedInterestPaid = payments.reduce((sum, p) => sum + (parseFloat(p.interest_component) || 0), 0);
  const calculatedPrincipalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.principal_component) || (parseFloat(p.amount) * 0.8)), 0);

  const paid = payments.length > 0 ? calculatedPrincipalPaid : 0;
  const interestPaid = payments.length > 0 ? calculatedInterestPaid : 0;
  const outstanding = Math.max(0, principal - paid);
  const progress = Math.min(100, Math.round((paid / principal) * 100));

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
    const m = p.payment_date ? p.payment_date.slice(0, 7) : new Date().toISOString().slice(0, 7);
    monthlyMap.set(m, (monthlyMap.get(m) || 0) + parseFloat(p.amount));
  });
  
  // Ensure current months are represented if empty
  if (monthlyMap.size === 0) {
    const curr = new Date().toISOString().slice(0, 7);
    monthlyMap.set(curr, 0);
  }

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
            <span className="text-2xl font-black text-[var(--color-text-primary)]">{progress}%</span>
            <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Repaid</span>
          </div>
        </div>

        {/* Numbers */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 gap-3 w-full">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Principal Paid</p>
            <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-1">{formatCurrency(paid)}</p>
            <p className="text-[10px] font-medium text-emerald-700/70 dark:text-emerald-400/70 mt-0.5">{((paid / principal) * 100).toFixed(1)}% of principal</p>
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
            <p className="text-[10px] font-medium text-blue-700/70 dark:text-blue-400/70 mt-0.5">{payments.length} logged payments</p>
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

      {/* Payment history visual bar chart */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Payment History Trend (Last {sortedMonths.length} Months)</p>
        <div className="flex items-end gap-2 h-20 bg-[var(--color-surface-secondary)] p-3 rounded-xl border border-[var(--color-border)]">
          {sortedMonths.map(([month, val]) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
              <div
                className="w-full rounded-t-md bg-[var(--color-primary)] group-hover:bg-[var(--color-primary-light)] transition-colors min-h-[4px]"
                style={{ height: `${val > 0 ? Math.max(15, (val / maxPayment) * 100) : 8}%` }}
                title={`${month}: ${formatCurrency(val)}`}
              />
              <span className="text-[9px] font-bold text-[var(--color-text-secondary)]">{month.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex justify-between text-xs font-medium text-[var(--color-text-secondary)] pt-1 border-t border-[var(--color-border)]">
        <span>Started: {formatDate(loan.start_date)}</span>
        <span>Matures: {formatDate(loan.end_date)}</span>
      </div>
    </div>
  );
}

// ── Amortization Repayment Schedule Component ─────────────────────────────────────
function RepaymentScheduleTable({ loan, payments }: { loan: Loan; payments: Payment[] }) {
  const [viewingReceipt, setViewingReceipt] = useState<Payment | null>(null);

  const emiAmount = parseFloat(loan.monthly_emi) || 1000;
  const startDate = new Date(loan.start_date);
  const totalMonths = Math.max(6, loan.total_payments || 12);

  // Sort payments chronologically
  const sortedPayments = [...payments].sort((a, b) => 
    new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
  );

  // Track remaining amounts of payments to distribute sequentially
  let paymentPool = sortedPayments.map(p => ({ ...p, remainingAmount: parseFloat(p.amount) || 0 }));

  const scheduleRows = Array.from({ length: totalMonths }).map((_, idx) => {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + idx);
    const monthKey = d.toISOString().slice(0, 7);

    // Calculate paid amount for this installment
    let paidForThisInst = 0;
    let matchedPayments: Payment[] = [];

    // Method 1: Check exact month payments
    const monthMatches = sortedPayments.filter(p => p.payment_date && p.payment_date.slice(0, 7) === monthKey);
    if (monthMatches.length > 0) {
      paidForThisInst = monthMatches.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      matchedPayments = monthMatches;
    } else {
      // Method 2: Sequential pool distribution
      for (const poolItem of paymentPool) {
        if (poolItem.remainingAmount > 0 && paidForThisInst < emiAmount) {
          const needed = emiAmount - paidForThisInst;
          const take = Math.min(needed, poolItem.remainingAmount);
          paidForThisInst += take;
          poolItem.remainingAmount -= take;
          matchedPayments.push(poolItem);
        }
      }
    }

    let status: "full" | "partial" | "pending" = "pending";
    let remainingDue = emiAmount;

    if (paidForThisInst >= emiAmount - 1) { // 1 rupee float margin
      status = "full";
      remainingDue = 0;
    } else if (paidForThisInst > 0) {
      status = "partial";
      remainingDue = emiAmount - paidForThisInst;
    }

    return {
      instNo: idx + 1,
      dueDate: d.toISOString().split("T")[0],
      monthName: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      amount: emiAmount,
      totalPaidInMonth: paidForThisInst,
      remainingDue,
      status,
      payments: matchedPayments,
    };
  });

  return (
    <div className="card p-4 sm:p-5 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--color-text-primary)]">
            📋 EMI Repayment Schedule & Installments Tracker
          </h2>
          <p className="text-[11px] sm:text-xs text-[var(--color-text-secondary)] mt-0.5">
            Track full & part-paid installments with receipts
          </p>
        </div>
        <span className="self-start sm:self-auto text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
          {scheduleRows.filter(r => r.status === "full").length} Full / {scheduleRows.filter(r => r.status === "partial").length} Part Paid
        </span>
      </div>

      {/* Fixed Height Scrollable Table Container */}
      <div className="overflow-x-auto overflow-y-auto max-h-[420px] rounded-xl border border-[var(--color-border)] shadow-inner custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs min-w-[640px]">
          <thead className="sticky top-0 z-10 bg-[var(--color-surface-secondary)] shadow-xs">
            <tr className="border-b border-[var(--color-border)] text-[10px] sm:text-[11px] font-black uppercase text-[var(--color-text-secondary)]">
              <th className="p-2.5 sm:p-3">#</th>
              <th className="p-2.5 sm:p-3">Month</th>
              <th className="p-2.5 sm:p-3">Due Date</th>
              <th className="p-2.5 sm:p-3">EMI Amount</th>
              <th className="p-2.5 sm:p-3">Paid Amount</th>
              <th className="p-2.5 sm:p-3">Remaining Pending</th>
              <th className="p-2.5 sm:p-3">Status</th>
              <th className="p-2.5 sm:p-3 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-light)] font-medium">
            {scheduleRows.map((row) => (
              <tr key={row.instNo} className="hover:bg-[var(--color-surface-secondary)]/60 transition-colors">
                <td className="p-2.5 sm:p-3 font-mono font-bold text-[var(--color-text-secondary)]">#{row.instNo}</td>
                <td className="p-2.5 sm:p-3 font-bold text-[var(--color-text-primary)]">{row.monthName}</td>
                <td className="p-2.5 sm:p-3 text-[var(--color-text-secondary)]">{formatDate(row.dueDate)}</td>
                <td className="p-2.5 sm:p-3 font-black text-[var(--color-text-primary)]">{formatCurrency(row.amount)}</td>
                <td className="p-2.5 sm:p-3 font-bold text-emerald-600 dark:text-emerald-400">
                  {row.totalPaidInMonth > 0 ? formatCurrency(row.totalPaidInMonth) : "—"}
                </td>
                <td className="p-2.5 sm:p-3">
                  {row.remainingDue > 0 ? (
                    <Link
                      href={`/dashboard/loans/${loan.id}/payments/new?amount=${row.remainingDue}&date=${row.dueDate}`}
                      className="font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                      title="Click to Pay Remaining Pending Amount"
                    >
                      {formatCurrency(row.remainingDue)}
                      <span className="text-[9px] bg-rose-500/10 text-rose-600 border border-rose-500/30 px-1 py-0.2 rounded font-black">Pay →</span>
                    </Link>
                  ) : (
                    <span className="font-bold text-emerald-600">₹0</span>
                  )}
                </td>
                <td className="p-2.5 sm:p-3">
                  {row.status === "full" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                      ✓ Fully Paid
                    </span>
                  )}
                  {row.status === "partial" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                      ⚠️ Part Paid ({formatCurrency(row.remainingDue)} Pending)
                    </span>
                  )}
                  {row.status === "pending" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/30 text-[var(--color-text-secondary)] font-bold text-[10px]">
                      ⏳ Pending
                    </span>
                  )}
                </td>
                <td className="p-2.5 sm:p-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Quick Pay + Button */}
                    {row.status !== "full" && (
                      <Link
                        href={`/dashboard/loans/${loan.id}/payments/new?amount=${row.remainingDue}&date=${row.dueDate}`}
                        className="px-2 py-1 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition font-black text-xs cursor-pointer flex items-center gap-1 shadow-xs"
                        title={`Pay ${row.monthName} EMI (${formatCurrency(row.remainingDue)})`}
                      >
                        <span>+</span>
                        <span className="hidden md:inline text-[10px]">Pay EMI</span>
                      </Link>
                    )}

                    {row.payments.length > 0 ? (
                      <button
                        onClick={() => setViewingReceipt(row.payments[0])}
                        className="p-1.5 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-[var(--color-text-primary)] transition cursor-pointer text-xs"
                        title="View Receipt"
                      >
                        👁️ ({row.payments.length})
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Receipt Modal with Full Financial Breakdown */}
      <Modal
        isOpen={!!viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        title="Official Payment Receipt & Statement Breakdown"
      >
        {viewingReceipt && (
          <div className="space-y-4 text-xs">
            {/* Header Voucher */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/30 text-center space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-[10px] text-[var(--color-text-secondary)] font-bold mb-1 border-b border-emerald-500/20 pb-1.5">
                <span>DEBTPROOF VERIFIED RECEIPT</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">ID: {viewingReceipt.reference_number || viewingReceipt.id.slice(0, 12)}</span>
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(parseFloat(viewingReceipt.amount))}</p>
              <p className="text-[11px] font-bold text-[var(--color-text-primary)]">
                Amount Paid for {loan.name}
              </p>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-black text-[9px] uppercase tracking-wider mt-1">
                ✓ Verified & Confirmed
              </span>
            </div>

            {/* Financial Impact & Remaining Summary */}
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
              <p className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                📊 Portfolio Impact & Balance Position
              </p>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div className="bg-[var(--color-surface)] p-2 rounded-lg border border-[var(--color-border)]">
                  <span className="text-[9px] font-bold text-[var(--color-text-secondary)] block">Total Loan Principal</span>
                  <span className="font-black text-[var(--color-text-primary)]">{formatCurrency(parseFloat(loan.principal_amount))}</span>
                </div>
                <div className="bg-[var(--color-surface)] p-2 rounded-lg border border-[var(--color-border)]">
                  <span className="text-[9px] font-bold text-[var(--color-text-secondary)] block">Remaining Outstanding</span>
                  <span className="font-black text-rose-500">{formatCurrency(Math.max(0, parseFloat(loan.principal_amount) - (payments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0))))}</span>
                </div>
              </div>
            </div>

            {/* Detailed Key Values Grid */}
            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
              <div>
                <span className="text-[9px] font-bold text-[var(--color-text-secondary)] block">Payment Date</span>
                <span className="font-black text-[var(--color-text-primary)]">{formatDate(viewingReceipt.payment_date)}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-[var(--color-text-secondary)] block">Payment Method</span>
                <span className="font-black uppercase text-[var(--color-text-primary)]">{viewingReceipt.payment_method}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-[var(--color-text-secondary)] block">Principal Portion</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(parseFloat(viewingReceipt.principal_component || viewingReceipt.amount))}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-[var(--color-text-secondary)] block">Interest Portion</span>
                <span className="font-black text-amber-500">{formatCurrency(parseFloat(viewingReceipt.interest_component || "0.00"))}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-[var(--color-text-secondary)] block">Lender Name</span>
                <span className="font-black text-[var(--color-text-primary)]">{loan.lender_name}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-[var(--color-text-secondary)] block">Account / Ref</span>
                <span className="font-mono font-bold text-[var(--color-text-primary)]">{loan.account_number || "Direct"}</span>
              </div>
            </div>

            {viewingReceipt.notes && (
              <div className="p-2.5 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border-light)]">
                <span className="text-[9px] font-bold text-[var(--color-text-secondary)] block mb-0.5">Payment Remark / Notes</span>
                <p className="font-medium text-[var(--color-text-primary)] text-[11px] leading-relaxed">{viewingReceipt.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
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

        {/* ── EMI Repayment Amortization Schedule & Tick Marks ── */}
        <RepaymentScheduleTable loan={loan} payments={payments} />

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
