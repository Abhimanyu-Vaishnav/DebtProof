/**
 * DebtProof — Loan Form Component
 * Used for both creating and editing loans.
 */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { loansService } from "@/services/loans.service";
import type { Loan, LoanFormData, LoanType, LoanStatus } from "@/types";

interface LoanFormProps {
  initialData?: Loan;
  isEdit?: boolean;
}

const LOAN_TYPE_OPTIONS = [
  { value: "home", label: "🏠 Home Loan" },
  { value: "personal", label: "👤 Personal Loan" },
  { value: "vehicle", label: "🚗 Vehicle Loan" },
  { value: "education", label: "🎓 Education Loan" },
  { value: "business", label: "💼 Business Loan" },
  { value: "credit_card", label: "💳 Credit Card" },
  { value: "other", label: "📄 Other" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
  { value: "on_hold", label: "On Hold" },
  { value: "defaulted", label: "Defaulted" },
];

type FormErrors = Partial<Record<keyof LoanFormData | "submit", string>>;

export function LoanForm({ initialData, isEdit = false }: LoanFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState<LoanFormData>({
    name: initialData?.name ?? "",
    loan_type: initialData?.loan_type ?? "personal",
    lender_name: initialData?.lender_name ?? "",
    account_number: initialData?.account_number ?? "",
    principal_amount: initialData?.principal_amount ?? "",
    interest_rate: initialData?.interest_rate ?? "",
    monthly_emi: initialData?.monthly_emi ?? "",
    start_date: initialData?.start_date ?? "",
    end_date: initialData?.end_date ?? "",
    next_emi_date: initialData?.next_emi_date ?? "",
    status: initialData?.status ?? "active",
    notes: initialData?.notes ?? "",
  });

  const set = (key: keyof LoanFormData) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Loan name is required.";
    if (!form.lender_name.trim()) errs.lender_name = "Lender name is required.";
    if (!form.principal_amount || parseFloat(form.principal_amount) <= 0)
      errs.principal_amount = "Principal amount must be greater than zero.";
    if (!form.interest_rate || parseFloat(form.interest_rate) < 0)
      errs.interest_rate = "Interest rate must be 0 or greater.";
    if (!form.monthly_emi || parseFloat(form.monthly_emi) <= 0)
      errs.monthly_emi = "EMI amount must be greater than zero.";
    if (!form.start_date) errs.start_date = "Start date is required.";
    if (!form.end_date) errs.end_date = "End date is required.";
    if (form.start_date && form.end_date && form.end_date <= form.start_date)
      errs.end_date = "End date must be after start date.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload: LoanFormData = {
        ...form,
        account_number: form.account_number || undefined,
        next_emi_date: form.next_emi_date || undefined,
        notes: form.notes || undefined,
      };

      if (isEdit && initialData) {
        await loansService.updateLoan(initialData.id, payload);
        showToast("Loan updated successfully.", "success");
        router.push(`/dashboard/loans/${initialData.id}`);
      } else {
        const loan = await loansService.createLoan(payload);
        showToast("Loan created successfully!", "success");
        router.push(`/dashboard/loans/${loan.id}`);
      }
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      setErrors({ submit: msg });
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.submit && (
        <div className="mb-5 px-4 py-3 rounded-[var(--radius-md)] bg-red-50 border border-red-200 text-sm text-[var(--color-error)]">
          {errors.submit}
        </div>
      )}

      <div className="space-y-5">
        {/* Basic Info */}
        <div>
          <h3 className="text-[13px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-3">
            Loan Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Loan Name"
              placeholder="e.g. HDFC Home Loan"
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
              error={errors.name}
              required
            />
            <Select
              label="Loan Type"
              options={LOAN_TYPE_OPTIONS}
              value={form.loan_type}
              onChange={set("loan_type")}
              required
            />
            <Input
              label="Lender Name"
              placeholder="e.g. HDFC Bank"
              value={form.lender_name}
              onChange={(e) => set("lender_name")(e.target.value)}
              error={errors.lender_name}
              required
            />
            <Input
              label="Account Number"
              placeholder="Optional"
              value={form.account_number}
              onChange={(e) => set("account_number")(e.target.value)}
              error={errors.account_number}
            />
          </div>
        </div>

        {/* Financial Details */}
        <div>
          <h3 className="text-[13px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-3">
            Financial Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Principal Amount (₹)"
              type="number"
              placeholder="e.g. 500000"
              value={form.principal_amount}
              onChange={(e) => set("principal_amount")(e.target.value)}
              error={errors.principal_amount}
              min="0.01"
              step="0.01"
              required
            />
            <Input
              label="Interest Rate (% per annum)"
              type="number"
              placeholder="e.g. 8.50"
              value={form.interest_rate}
              onChange={(e) => set("interest_rate")(e.target.value)}
              error={errors.interest_rate}
              min="0"
              max="100"
              step="0.01"
              required
            />
            <Input
              label="Monthly EMI (₹)"
              type="number"
              placeholder="e.g. 10000"
              value={form.monthly_emi}
              onChange={(e) => set("monthly_emi")(e.target.value)}
              error={errors.monthly_emi}
              min="0.01"
              step="0.01"
              required
            />
            {isEdit && (
              <Select
                label="Status"
                options={STATUS_OPTIONS}
                value={form.status ?? "active"}
                onChange={set("status")}
              />
            )}
          </div>
        </div>

        {/* Dates */}
        <div>
          <h3 className="text-[13px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)] mb-3">
            Schedule
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={form.start_date}
              onChange={(e) => set("start_date")(e.target.value)}
              error={errors.start_date}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={form.end_date}
              onChange={(e) => set("end_date")(e.target.value)}
              error={errors.end_date}
              required
            />
            <Input
              label="Next EMI Date"
              type="date"
              value={form.next_emi_date ?? ""}
              onChange={(e) => set("next_emi_date")(e.target.value)}
              hint="Optional"
            />
          </div>
        </div>

        {/* Notes */}
        <Textarea
          label="Notes"
          placeholder="Any additional notes about this loan..."
          value={form.notes ?? ""}
          onChange={(e) => set("notes")(e.target.value)}
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-6 mt-6 border-t border-[var(--color-border)]">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {isEdit ? "Saving..." : "Creating..."}
            </span>
          ) : (
            isEdit ? "Save Changes" : "Create Loan"
          )}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as { response?: { data?: { error?: { message?: string }; detail?: string } } };
    return (
      axiosErr.response?.data?.error?.message ??
      axiosErr.response?.data?.detail ??
      "An error occurred. Please try again."
    );
  }
  return "An error occurred. Please try again.";
}
