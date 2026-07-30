/**
 * DebtProof — All Payments Page (v3 Redesign)
 * Lists all payments across all loans, with inline stat row and modern pill-tabs.
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
import { SmartAutoPayEMISplitterStudio } from "@/components/payments/SmartAutoPayEMISplitterStudio";
import { MonadSmartAutoEscrowStudio } from "@/components/payments/MonadSmartAutoEscrowStudio";
import type { Payment } from "@/types";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

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

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

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
  const hasActiveFilters = !!(search || statusFilter);

  return (
    <>
      <Topbar title="Payment History" subtitle={`${totalCount} payment${totalCount !== 1 ? "s" : ""}`} />
      <main className="page-content space-y-5">
        {/* Monad Smart Auto-Escrow Repayment Trigger Studio */}
        <MonadSmartAutoEscrowStudio />

        {/* Dynamic Auto-Pay EMI Splitter Studio */}
        <SmartAutoPayEMISplitterStudio />

        {/* Modern Filter Toolbar */}
        <div className="filter-bar">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Pill tabs for status */}
            <div className="flex items-center gap-1 flex-wrap">
              {STATUS_TABS.map((tab) => {
                const isActive = statusFilter === tab.value;
                const activeClass =
                  tab.value === "failed" ? "active-error"
                  : tab.value === "confirmed" ? "active-success"
                  : tab.value === "pending" ? "active-warning"
                  : "active";
                return (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className={`status-tab ${isActive ? activeClass : ""}`}
                  >
                    {tab.label}
                  </button>
                );
              })}
              {hasActiveFilters && (
                <button onClick={resetFilters} className="status-tab text-[var(--color-text-tertiary)] hover:text-red-400">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Search payments, loans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input !pl-9 !py-2 text-[13px] w-full"
            />
          </div>
        </div>

        {/* Inline Summary Strip */}
        {payments.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-item-label">Showing</span>
                <span className="stat-item-value">{payments.length} payments</span>
              </div>
              <div className="stat-item border-l border-[var(--color-border)] pl-4">
                <span className="stat-item-label">Page Total</span>
                <span className="stat-item-value text-emerald-400">{formatCurrency(totalAmount)}</span>
              </div>
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
            <div className="space-y-2.5">
              {payments.map((p) => (
                <PaymentCard key={p.id} payment={p} showLoan onDelete={setDeleteId} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-5">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn btn-secondary btn-sm">← Previous</button>
                <span className="text-[13px] text-[var(--color-text-secondary)] px-3 py-1.5 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border)] font-medium">{page} / {totalPages}</span>
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
