/**
 * DebtProof — Loan Status Badge
 */
import React from "react";
import { LoanStatus } from "@/types";

const CONFIG: Record<LoanStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "badge badge-success" },
  closed: { label: "Closed", className: "badge badge-neutral" },
  defaulted: { label: "Defaulted", className: "badge badge-error" },
  on_hold: { label: "On Hold", className: "badge badge-warning" },
};

export function LoanStatusBadge({ status, overdue }: { status: LoanStatus; overdue?: boolean }) {
  if (overdue && status === "active") {
    return <span className="badge badge-error">Overdue</span>;
  }
  const { label, className } = CONFIG[status] ?? { label: status, className: "badge badge-neutral" };
  return <span className={className}>{label}</span>;
}
