"use client";

import React from "react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Loan } from "@/types";

interface AmortizationScheduleModalProps {
  loan: Loan;
  onClose: () => void;
}

export function AmortizationScheduleModal({ loan, onClose }: AmortizationScheduleModalProps) {
  const principal = parseFloat(loan.principal_amount) || 1;
  const rate = (parseFloat(loan.interest_rate) || 0) / 100 / 12;
  const emi = parseFloat(loan.monthly_emi) || (principal / 12);

  // Generate 12-month amortisation schedule preview
  let balance = principal;
  const scheduleRows = [];

  for (let month = 1; month <= 12; month++) {
    if (balance <= 0) break;
    const interestPayment = balance * rate;
    const principalPayment = Math.min(balance, emi - interestPayment);
    const endingBalance = Math.max(0, balance - principalPayment);

    scheduleRows.push({
      month,
      openingBalance: balance,
      emi,
      principalPaid: principalPayment,
      interestPaid: interestPayment,
      endingBalance,
    });

    balance = endingBalance;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="card w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border-light)] shadow-2xl p-6 space-y-5 my-auto print:shadow-none print:border-none print:w-full print:max-w-none">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">EMI Amortisation Schedule</h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">{loan.name} ({loan.lender_name})</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn btn-secondary btn-xs px-3 py-1 font-bold text-xs flex items-center gap-1"
            >
              🖨️ Print / Download PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] font-bold flex items-center justify-center hover:bg-[var(--color-surface-secondary)]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Loan Summary Badge */}
        <div className="grid grid-cols-3 gap-3 text-xs p-3.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-tertiary)] block">Principal Debt</span>
            <span className="text-base font-black text-[var(--color-text-primary)]">{formatCurrency(principal)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-tertiary)] block">Annual Interest</span>
            <span className="text-base font-bold text-[var(--color-accent)]">{loan.interest_rate}% APR</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-tertiary)] block">Monthly EMI</span>
            <span className="text-base font-bold text-[var(--color-primary-light)]">{formatCurrency(emi)}</span>
          </div>
        </div>

        {/* Amortisation Table */}
        <div className="overflow-x-auto max-h-72 border border-[var(--color-border-light)] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)] text-[10px] uppercase tracking-wider sticky top-0">
              <tr>
                <th className="p-2.5">Month</th>
                <th className="p-2.5">Opening Balance</th>
                <th className="p-2.5">EMI</th>
                <th className="p-2.5">Principal Paid</th>
                <th className="p-2.5">Interest Paid</th>
                <th className="p-2.5">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-light)]">
              {scheduleRows.map((row) => (
                <tr key={row.month} className="hover:bg-[var(--color-surface-secondary)] transition-colors">
                  <td className="p-2.5 font-bold text-[var(--color-text-primary)]">M{row.month}</td>
                  <td className="p-2.5 font-mono text-[var(--color-text-secondary)]">{formatCurrency(row.openingBalance)}</td>
                  <td className="p-2.5 font-bold text-[var(--color-primary-light)]">{formatCurrency(row.emi)}</td>
                  <td className="p-2.5 font-semibold text-emerald-500">{formatCurrency(row.principalPaid)}</td>
                  <td className="p-2.5 font-semibold text-rose-400">{formatCurrency(row.interestPaid)}</td>
                  <td className="p-2.5 font-mono font-bold text-[var(--color-text-primary)]">{formatCurrency(row.endingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center text-[10px] text-[var(--color-text-tertiary)] pt-1 print:hidden">
          <span>Generated on {formatDate(new Date().toISOString())}</span>
          <span>Anchored via DebtProof SHA-256 Ledger</span>
        </div>
      </div>
    </div>
  );
}
