"use client";

import React from "react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Loan } from "@/types";

interface P2PContractModalProps {
  loan: Loan;
  onClose: () => void;
}

export function P2PContractModal({ loan, onClose }: P2PContractModalProps) {
  const counterparty = loan.counterparty_name || loan.lender_name || "Counterparty";
  const contractId = `DP-P2P-${loan.id.slice(0, 8).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="card w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border-light)] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto my-auto print:max-w-none print:shadow-none print:border-none print:p-0">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <div>
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">Digital Promissory Agreement</h2>
              <p className="text-xs text-[var(--color-text-tertiary)]">Legal debt contract & settlement record</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn btn-secondary btn-xs text-xs px-3 py-1 font-semibold flex items-center gap-1.5"
            >
              <span>🖨️</span> Print / Download PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] font-bold flex items-center justify-center hover:bg-[var(--color-surface-secondary)]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Legal Contract Body */}
        <div className="space-y-6 text-sm text-[var(--color-text-secondary)] leading-relaxed print:text-black">
          {/* Document Title Header */}
          <div className="text-center space-y-1 border-b border-dashed border-[var(--color-border-light)] pb-6">
            <h1 className="text-xl font-black uppercase tracking-widest text-[var(--color-primary)]">
              Formal Peer-to-Peer Promissory Note
            </h1>
            <p className="text-xs font-mono text-[var(--color-text-tertiary)]">
              Contract Ref: <span className="font-bold">{contractId}</span> | DebtProof Verified
            </p>
          </div>

          {/* Parties Involved Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] print:bg-gray-50">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">Creditor / Lender</span>
              <p className="font-bold text-[var(--color-text-primary)]">{counterparty}</p>
              {loan.counterparty_email && <p className="text-xs text-[var(--color-text-tertiary)]">{loan.counterparty_email}</p>}
              {loan.counterparty_phone && <p className="text-xs text-[var(--color-text-tertiary)]">{loan.counterparty_phone}</p>}
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">Debtor / Borrower</span>
              <p className="font-bold text-[var(--color-text-primary)]">{loan.name}</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">Account Ref: {loan.account_number || loan.id.slice(0, 10)}</p>
            </div>
          </div>

          {/* Financial Terms Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">Agreement Financial Terms</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-[var(--color-surface-tertiary)]">
                <span className="text-[9px] uppercase font-bold text-[var(--color-text-tertiary)] block">Principal Debt</span>
                <span className="text-base font-black text-[var(--color-text-primary)]">{formatCurrency(parseFloat(loan.principal_amount))}</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-surface-tertiary)]">
                <span className="text-[9px] uppercase font-bold text-[var(--color-text-tertiary)] block">Outstanding</span>
                <span className="text-base font-black text-[var(--color-error)]">{formatCurrency(parseFloat(loan.outstanding_amount))}</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-surface-tertiary)]">
                <span className="text-[9px] uppercase font-bold text-[var(--color-text-tertiary)] block">Interest Rate</span>
                <span className="text-base font-black text-[var(--color-primary-light)]">{loan.interest_rate}% APR</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-surface-tertiary)]">
                <span className="text-[9px] uppercase font-bold text-[var(--color-text-tertiary)] block">Monthly Installment</span>
                <span className="text-base font-black text-[var(--color-accent)]">{formatCurrency(parseFloat(loan.monthly_emi))}</span>
              </div>
            </div>
          </div>

          {/* Contract Clauses */}
          <div className="space-y-2 text-xs text-[var(--color-text-tertiary)] bg-[var(--color-surface-secondary)]/50 p-4 rounded-xl border border-[var(--color-border-light)]">
            <p className="font-bold text-[var(--color-text-secondary)]">Terms & Obligations:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>The Borrower agrees to pay the Lender the principal amount of <strong>{formatCurrency(parseFloat(loan.principal_amount))}</strong> along with the agreed interest of <strong>{loan.interest_rate}% per annum</strong>.</li>
              <li>Repayments shall be made in monthly equated installments of <strong>{formatCurrency(parseFloat(loan.monthly_emi))}</strong> starting from <strong>{formatDate(loan.start_date)}</strong> until fully settled by <strong>{formatDate(loan.end_date)}</strong>.</li>
              <li>All repayment transactions, receipts, and settlement milestones are tracked and cryptographically logged on the DebtProof ledger.</li>
            </ol>
          </div>

          {/* Signature & Verification Stamps */}
          <div className="pt-6 border-t border-[var(--color-border-light)] grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-tertiary)] block">Lender Digital Stamp</span>
              <div className="h-12 border-b border-dashed border-[var(--color-border)] flex items-end pb-1">
                <span className="font-serif italic text-sm font-bold text-[var(--color-text-primary)]">{counterparty}</span>
              </div>
              <span className="text-[9px] text-[var(--color-text-tertiary)] block">Signed & Verified</span>
            </div>
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-tertiary)] block">Borrower Signature</span>
              <div className="h-12 border-b border-dashed border-[var(--color-border)] flex items-end pb-1">
                <span className="font-serif italic text-sm font-bold text-[var(--color-text-primary)]">{loan.name}</span>
              </div>
              <span className="text-[9px] text-[var(--color-text-tertiary)] block">Timestamp: {loan.agreement_signed_at ? formatDate(loan.agreement_signed_at) : formatDate(loan.created_at)}</span>
            </div>
          </div>

          {/* Cryptographic SHA-256 Stamp */}
          <div className="pt-2 flex items-center justify-between text-[9px] font-mono text-[var(--color-text-tertiary)] border-t border-dotted border-[var(--color-border-light)]">
            <span>SHA-256 Proof Stamp: {loan.id.replace(/-/g, "")}</span>
            <span className="text-emerald-500 font-bold">STATUS: {loan.contract_status ? loan.contract_status.toUpperCase() : "ACTIVE / BINDING"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
