/**
 * DebtProof — Loans Listing Page (v3 Redesign)
 * Clean modern filter bar with pill-tab status switcher.
 */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { LoanCard } from "@/components/loans/LoanCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useDebounce } from "@/hooks/useDebounce";
import { loansService } from "@/services/loans.service";
import { useSubscription } from "@/context/SubscriptionContext";
import { CibilParserModal } from "@/components/loans/CibilParserModal";
import { AutomatedAIRepaymentAgentStudio } from "@/components/loans/AutomatedAIRepaymentAgentStudio";
import { ForeclosureSavingsCalculator } from "@/components/loans/ForeclosureSavingsCalculator";
import { DebtDestroyerAssistant } from "@/components/ai/DebtDestroyerAssistant";
import { ClearanceCertificateModal } from "@/components/loans/ClearanceCertificateModal";
import type { Loan } from "@/types";

const STATUS_TABS = [
  { value: "", label: "All" },
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
  const { canCreateLoan, openPaywall } = useSubscription();
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

  const [activePlan, setActivePlan] = useState<string>("Free");

  useEffect(() => {
    import("@/services/plan.service").then((mod) => {
      setActivePlan(mod.getUserPlan());
    });
    const onPlanChanged = () => {
      import("@/services/plan.service").then((mod) => {
        setActivePlan(mod.getUserPlan());
      });
    };
    window.addEventListener("debtproof_plan_changed", onPlanChanged);
    return () => window.removeEventListener("debtproof_plan_changed", onPlanChanged);
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

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
  const hasActiveFilters = !!(search || statusFilter || typeFilter || ordering !== "-created_at");

  return (
    <>
      <Topbar title="My Loans" subtitle={`${totalCount} loan${totalCount !== 1 ? "s" : ""}`} />
      <main className="page-content space-y-5">

        {/* Foreclosure & Part-Prepayment Savings Calculator */}
        <ForeclosureSavingsCalculator />

        {/* AI Repayment Studio */}
        <AutomatedAIRepaymentAgentStudio />

        {/* ── Filter Bar ── */}
        <div className="filter-bar">
          {/* Row 1: Status tabs + actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Pill tabs */}
            <div className="flex items-center gap-1 flex-wrap">
              {STATUS_TABS.map((tab) => {
                const isActive = statusFilter === tab.value;
                const activeClass =
                  tab.value === "defaulted" ? "active-error"
                  : tab.value === "closed" ? "active-success"
                  : tab.value === "on_hold" ? "active-warning"
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

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  const check = canCreateLoan();
                  if (!check.allowed) {
                    openPaywall({ reason: check.reason });
                  } else {
                    setShowCibilModal(true);
                  }
                }}
                className="btn btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Import CIBIL
              </button>
              <button
                onClick={() => {
                  const check = canCreateLoan();
                  if (!check.allowed) {
                    openPaywall({ reason: check.reason });
                  } else {
                    window.location.href = "/dashboard/loans/new";
                  }
                }}
                className="btn btn-primary btn-sm cursor-pointer"
              >
                + New Loan
              </button>
            </div>
          </div>

          {/* Row 2: Search + Type + Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                placeholder="Search loans, lenders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input !pl-9 !py-2 text-[13px] w-full"
              />
            </div>

            {/* Type */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="form-input !py-2 text-[13px] w-full appearance-none cursor-pointer"
              >
                {TYPE_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-tertiary)]">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="form-input !py-2 text-[13px] w-full appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-tertiary)]">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* ── Plan Notice Strip ── */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
            <p className="text-[12px] text-[var(--color-text-secondary)]">
              Plan: <span className="font-semibold text-[var(--color-text-primary)]">{activePlan}</span>
              {activePlan === "Free" && " · Limited to 2 loans"}
              {activePlan === "Basic" && " · Limited to 5 loans"}
            </p>
          </div>
          <Link
            href="/#pricing"
            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors shrink-0"
          >
            Upgrade →
          </Link>
        </div>

        {/* AI Assistant */}
        <DebtDestroyerAssistant />

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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                <span className="text-[13px] text-[var(--color-text-secondary)] px-3 py-1.5 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border)] font-medium">
                  {page} / {totalPages}
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
