/**
 * DebtProof — Loans Listing Page
 * Search, filter, sort, paginate user's loans.
 */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { LoanCard } from "@/components/loans/LoanCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useDebounce } from "@/hooks/useDebounce";
import { loansService } from "@/services/loans.service";
import { CibilParserModal } from "@/components/loans/CibilParserModal";
import type { Loan } from "@/types";

const STATUS_FILTERS = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
  { value: "defaulted", label: "Defaulted" },
  { value: "on_hold", label: "On Hold" },
];

const TYPE_FILTERS = [
  { value: "", label: "All Types" },
  { value: "home", label: "Home Loan" },
  { value: "personal", label: "Personal Loan" },
  { value: "vehicle", label: "Vehicle Loan" },
  { value: "education", label: "Education Loan" },
  { value: "business", label: "Business Loan" },
  { value: "credit_card", label: "Credit Card" },
  { value: "other", label: "Other" },
];

const SORT_OPTIONS = [
  { value: "-created_at", label: "Newest First" },
  { value: "created_at", label: "Oldest First" },
  { value: "-principal_amount", label: "Highest Loan" },
  { value: "principal_amount", label: "Lowest Loan" },
  { value: "-outstanding_amount", label: "Highest Outstanding" },
  { value: "-updated_at", label: "Recently Updated" },
];

export default function LoansPage() {
  const { showToast } = useToast();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [ordering, setOrdering] = useState("-created_at");

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await loansService.getLoans({
        page,
        page_size: 12,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        loan_type: typeFilter || undefined,
        ordering,
      });
      setLoans(res.results ?? []);
      setTotalCount(res.pagination?.count ?? 0);
      setTotalPages(res.pagination?.total_pages ?? 1);
    } catch {
      showToast("Failed to load loans.", "error");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, typeFilter, ordering, showToast]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, typeFilter, ordering]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");
    setOrdering("-created_at");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await loansService.deleteLoan(deleteId);
      showToast("Loan deleted.", "success");
      setDeleteId(null);
      fetchLoans();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? "Failed to delete loan.";
      showToast(msg, "error");
    } finally {
      setDeleting(false);
    }
  };

  const [showCibilModal, setShowCibilModal] = useState(false);

  return (
    <>
      <Topbar title="My Loans" subtitle={`${totalCount} total loan${totalCount !== 1 ? "s" : ""}`} />
      <main className="page-content">
        {/* Modern Filter Toolbar */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] p-4 rounded-2xl shadow-sm mb-6 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 rounded-full bg-[var(--color-primary)]" />
              <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Filter Portfolio</h2>
            </div>
            <div className="flex items-center gap-2">
              {(search || statusFilter || typeFilter || ordering !== "-created_at") && (
                <button
                  onClick={resetFilters}
                  className="btn btn-secondary btn-sm font-semibold shrink-0 cursor-pointer transition-all hover:bg-[var(--color-surface-secondary)]"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => setShowCibilModal(true)}
                className="btn btn-secondary btn-sm shrink-0 font-bold flex items-center gap-1 text-xs"
              >
                <span>📄</span> Import CIBIL Report
              </button>
              <Link href="/dashboard/loans/new" className="btn btn-primary btn-sm shrink-0 font-bold shadow-sm shadow-[var(--color-primary)]/10 hover:shadow-md transition-all">
                + New Loan
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                placeholder="Search loans, lenders..."
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
                {STATUS_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-tertiary)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="form-input py-2.5 px-3 text-xs font-medium w-full rounded-xl bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface)] transition-all cursor-pointer appearance-none"
              >
                {TYPE_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-tertiary)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Sort Options */}
            <div className="relative">
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="form-input py-2.5 px-3 text-xs font-medium w-full rounded-xl bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface)] transition-all cursor-pointer appearance-none"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-tertiary)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Grid */}
        {loading ? (
          <LoadingSpinner fullPage label="Loading loans..." />
        ) : loans.length === 0 ? (
          <EmptyState
            title="No loans found"
            description={
              search || statusFilter || typeFilter
                ? "Try adjusting your search or filters."
                : "Add your first loan to start tracking repayments and generating proof."
            }
            actionLabel={!(search || statusFilter || typeFilter) ? "+ Add First Loan" : undefined}
            actionHref={!(search || statusFilter || typeFilter) ? "/dashboard/loans/new" : undefined}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {loans.map((loan) => (
                <LoanCard key={loan.id} loan={loan} onDelete={setDeleteId} searchQuery={debouncedSearch} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="btn btn-secondary btn-sm"
                >
                  ← Previous
                </button>
                <span className="text-sm text-[var(--color-text-secondary)] px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn btn-secondary btn-sm"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Loan"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteId(null)} disabled={deleting}>
              Cancel
            </button>
            <button className="btn bg-[var(--color-error)] text-white border-[var(--color-error)]" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Loan"}
            </button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-text-secondary)]">
          Are you sure you want to delete this loan? This action cannot be undone.
          Loans with payments cannot be deleted.
        </p>
      </Modal>

      {showCibilModal && (
        <CibilParserModal
          onClose={() => setShowCibilModal(false)}
          onSuccess={fetchLoans}
        />
      )}
    </>
  );
}
