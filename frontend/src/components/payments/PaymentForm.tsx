/**
 * DebtProof — Payment Form Component
 */
"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FileUpload } from "@/components/ui/FileUpload";
import { useToast } from "@/components/ui/Toast";
import { paymentsService } from "@/services/payments.service";
import type { Loan, PaymentFormData } from "@/types";

interface PaymentFormProps {
  loan: Loan;
}

const PAYMENT_METHOD_OPTIONS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "upi", label: "UPI" },
  { value: "neft", label: "NEFT" },
  { value: "rtgs", label: "RTGS" },
  { value: "cheque", label: "Cheque" },
  { value: "auto_debit", label: "Auto Debit" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
];

type FormErrors = Partial<Record<keyof PaymentFormData | "submit", string>>;

export function PaymentForm({ loan }: PaymentFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const initialAmount = searchParams?.get("amount") || "";
  const initialDate = searchParams?.get("date") || today;

  const [form, setForm] = useState<PaymentFormData>({
    amount: initialAmount,
    payment_date: initialDate,
    payment_method: "bank_transfer",
    reference_number: "",
    status: "confirmed",
    principal_component: "",
    interest_component: "",
    notes: "",
  });

  const set = (key: keyof PaymentFormData) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    const amount = parseFloat(form.amount);
    const outstanding = parseFloat(loan.outstanding_amount);

    if (!form.amount || isNaN(amount) || amount <= 0) {
      errs.amount = "Payment amount must be greater than zero.";
    } else if (amount > outstanding) {
      errs.amount = `Amount cannot exceed outstanding balance (₹${outstanding.toLocaleString("en-IN")}).`;
    }
    if (!form.payment_date) errs.payment_date = "Payment date is required.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payment = await paymentsService.createPayment(loan.id, {
        ...form,
        reference_number: form.reference_number || undefined,
        principal_component: form.principal_component || undefined,
        interest_component: form.interest_component || undefined,
        notes: form.notes || undefined,
      } as PaymentFormData);

      // Upload receipt if provided
      if (receiptFile) {
        try {
          await paymentsService.uploadReceipt(payment.id, receiptFile);
          showToast("Payment recorded with receipt!", "success");
        } catch {
          showToast("Payment recorded. Receipt upload failed — try again.", "warning");
        }
      } else {
        showToast("Payment recorded successfully.", "success");
      }

      router.push(`/dashboard/loans/${loan.id}`);
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      setErrors({ submit: msg });
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const outstanding = parseFloat(loan.outstanding_amount);

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.submit && (
        <div className="mb-5 px-4 py-3 rounded-[var(--radius-md)] bg-red-50 border border-red-200 text-sm text-[var(--color-error)]">
          {errors.submit}
        </div>
      )}

      {/* Detailed Loan & Pending Amount Context Banner */}
      <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--color-surface-secondary)] to-[var(--color-surface-secondary)] border border-[var(--color-primary)]/20 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">Recording Payment For</p>
            <h3 className="text-sm font-black text-[var(--color-text-primary)]">{loan.name}</h3>
          </div>
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[var(--color-surface-tertiary)] border border-[var(--color-border-light)] text-[var(--color-text-secondary)]">
            {loan.lender_name}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <span className="text-[9px] font-bold text-[var(--color-text-secondary)] block">Total Outstanding Due</span>
            <span className="font-black text-rose-500 text-sm">₹{outstanding.toLocaleString("en-IN")}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <span className="text-[9px] font-bold text-[var(--color-text-secondary)] block">Scheduled Monthly EMI</span>
            <span className="font-black text-[var(--color-primary)] text-sm">₹{parseFloat(loan.monthly_emi).toLocaleString("en-IN")}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] col-span-2 sm:col-span-1">
            <span className="text-[9px] font-bold text-[var(--color-text-secondary)] block">Interest Rate</span>
            <span className="font-black text-[var(--color-text-primary)] text-sm">{loan.interest_rate}% p.a.</span>
          </div>
        </div>

        {/* Dynamic Pending Helper */}
        <div className="text-[11px] font-bold text-[var(--color-text-secondary)] flex items-center justify-between pt-1">
          <span>💡 Next EMI Due Date: <span className="text-[var(--color-text-primary)]">{loan.next_emi_date || "Monthly"}</span></span>
          <span className="text-emerald-600 dark:text-emerald-400">Total Payments: {loan.total_payments || 0}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Amount Paid (₹)"
            type="number"
            placeholder={loan.monthly_emi}
            value={form.amount}
            onChange={(e) => set("amount")(e.target.value)}
            error={errors.amount}
            min="0.01"
            step="0.01"
            required
          />
          <Input
            label="Payment Date"
            type="date"
            value={form.payment_date}
            onChange={(e) => set("payment_date")(e.target.value)}
            error={errors.payment_date}
            required
          />
          <Select
            label="Payment Method"
            options={PAYMENT_METHOD_OPTIONS}
            value={form.payment_method}
            onChange={set("payment_method")}
          />
          <Input
            label="Reference / UTR Number"
            placeholder="Optional"
            value={form.reference_number ?? ""}
            onChange={(e) => set("reference_number")(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Principal Component (₹)"
            type="number"
            placeholder="Optional"
            value={form.principal_component ?? ""}
            onChange={(e) => set("principal_component")(e.target.value)}
            hint="Portion reducing principal"
          />
          <Input
            label="Interest Component (₹)"
            type="number"
            placeholder="Optional"
            value={form.interest_component ?? ""}
            onChange={(e) => set("interest_component")(e.target.value)}
            hint="Portion covering interest"
          />
        </div>

        <Textarea
          label="Notes"
          placeholder="Optional payment notes..."
          value={form.notes ?? ""}
          onChange={(e) => set("notes")(e.target.value)}
          rows={2}
        />

        <FileUpload
          label="Upload Receipt (Optional)"
          accept=".pdf,.jpg,.jpeg,.png"
          onFileSelect={(file) => setReceiptFile(file)}
          onRemove={() => setReceiptFile(null)}
          existingFile={receiptFile ? { name: receiptFile.name } : null}
        />
      </div>

      <div className="flex items-center gap-3 pt-6 mt-6 border-t border-[var(--color-border)]">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Recording...
            </span>
          ) : (
            "Record Payment"
          )}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => router.back()} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
    return axiosErr.response?.data?.error?.message ?? "An error occurred.";
  }
  return "An error occurred.";
}
