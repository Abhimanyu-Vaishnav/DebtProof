/**
 * DebtProof — All Payments Page
 * Lists all payments across all loans, with search and filter.
 */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { PaymentCard } from "@/components/payments/PaymentCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useDebounce } from "@/hooks/useDebounce";
import { paymentsService } from "@/services/payments.service";
import { formatCurrency } from "@/utils/formatters";
import type { Payment } from "@/types";

export default function PaymentsPage() {
  const { showToast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentsService.getAllPayments({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        ordering: "-payment_date",
      });
      setPayments(res.results ?? []);
      setTotalCount(res.pagination?.count ?? 0);
      setTotalPages(res.pagination?.total_pages ?? 1);
    } catch {
      showToast("Failed to load payments.", "error");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, showToast]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);
  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await paymentsService.deletePayment(deleteId);
      showToast("Payment deleted.", "success");
      setDeleteId(null);
      fetchPayments();
    } catch {
      showToast("Failed to delete payment.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <>
      <Topbar title="Payment History" subtitle={`${totalCount} total payment${totalCount !== 1 ? "s" : ""}`} />
      <main className="page-content">
        {/* Modern Filter Toolbar */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] p-4 rounded-2xl shadow-sm mb-6 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 rounded-full bg-[var(--color-primary)]" />
              <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Filter Payments</h2>
            </div>
            <div className="flex items-center gap-2">
              {(search || statusFilter) && (
                <button
                  onClick={resetFilters}
                  className="btn btn-secondary btn-sm font-semibold shrink-0 cursor-pointer transition-all hover:bg-[var(--color-surface-secondary)]"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Search Input */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                placeholder="Search payments, loans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input !pl-10 py-2.5 text-xs font-medium w-full rounded-xl bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)] transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input py-2.5 px-3 text-xs font-medium w-full rounded-xl bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface)] transition-all cursor-pointer appearance-none"
              >
                <option value="">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-tertiary)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Summary card */}
        {payments.length > 0 && (
          <div className="card p-4 mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wide">Showing</p>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{payments.length} payments</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wide">Page Total</p>
              <p className="text-sm font-bold text-[var(--color-accent)]">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSpinner fullPage label="Loading payments..." />
        ) : payments.length === 0 ? (
          <EmptyState
            title="No payments found"
            description={search || statusFilter ? "Try adjusting your search." : "Record your first payment on a loan."}
            actionLabel="View Loans"
            actionHref="/dashboard/loans"
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
          />
        ) : (
          <>
            <div className="space-y-3">
              {payments.map((p) => (
                <PaymentCard key={p.id} payment={p} showLoan onDelete={setDeleteId} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-5">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn btn-secondary btn-sm">← Previous</button>
                <span className="text-sm text-[var(--color-text-secondary)] px-2">Page {page} of {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn btn-secondary btn-sm">Next →</button>
              </div>
            )}
          </>
        )}
      </main>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Payment"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</button>
            <button className="btn bg-[var(--color-error)] text-white border-[var(--color-error)]" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-text-secondary)]">Delete this payment record? The loan outstanding balance will be recalculated.</p>
      </Modal>
    </>
  );
}
