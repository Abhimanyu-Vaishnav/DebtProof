/**
 * DebtProof — Money Given / Loan Lent Modal Form
 * Allows user to record money given to someone (friends, family, P2P, business),
 * specifying borrower name, amount, tenure (Short-Term Current vs Long-Term Fixed Asset),
 * interest rate, and expected return date.
 */
"use client";

import React, { useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface MoneyGivenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    asset_type: "loan_given_short" | "loan_given_long" | "receivable";
    value: string;
  }) => void;
}

export function MoneyGivenModal({ isOpen, onClose, onSubmit }: MoneyGivenModalProps) {
  const { currency } = useCurrency();

  const [borrowerName, setBorrowerName] = useState("");
  const [amount, setAmount] = useState("");
  const [tenureType, setTenureType] = useState<"short" | "long">("short");
  const [purpose, setPurpose] = useState("Personal Loan Given");
  const [interestRate, setInterestRate] = useState("0");
  const [expectedDate, setExpectedDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!borrowerName.trim()) {
      setError("Please enter borrower / person name.");
      return;
    }

    const valNum = parseFloat(amount);
    if (isNaN(valNum) || valNum <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    const assetType = tenureType === "short" ? "loan_given_short" : "loan_given_long";
    const displayName = `${borrowerName.trim()} (${purpose}${parseFloat(interestRate) > 0 ? ` @ ${interestRate}%` : ""}${expectedDate ? ` due ${expectedDate}` : ""})`;

    onSubmit({
      name: displayName,
      asset_type: assetType,
      value: valNum.toFixed(2),
    });

    // Reset
    setBorrowerName("");
    setAmount("");
    setPurpose("Personal Loan Given");
    setInterestRate("0");
    setExpectedDate("");
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="card w-full max-w-lg p-6 shadow-2xl bg-[var(--color-surface)] border border-[var(--color-border-light)] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl shrink-0 border border-emerald-500/20">
              🤝
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Record Money Lent / Given</h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">Track loan given to someone as an Asset</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] font-bold flex items-center justify-center hover:bg-[var(--color-surface-secondary)]"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-xs font-semibold text-[var(--color-error)] flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Borrower Name */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
              Borrower / Person Name <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              type="text"
              className="input w-full"
              placeholder="e.g. Ramesh Kumar, TechCorp LLC"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
            />
          </div>

          {/* Amount & Tenure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
                Amount Lent ({currency.symbol}) <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                className="input w-full font-bold"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
                Tenure / Asset Class
              </label>
              <select
                className="input w-full h-10 py-1 font-medium text-xs"
                value={tenureType}
                onChange={(e) => setTenureType(e.target.value as "short" | "long")}
              >
                <option value="short">Short-Term (&lt;1 Year) — Current Asset</option>
                <option value="long">Long-Term (&gt;1 Year) — Fixed Asset</option>
              </select>
            </div>
          </div>

          {/* Purpose & Interest Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
                Purpose / Category
              </label>
              <input
                type="text"
                className="input w-full text-xs"
                placeholder="e.g. Personal emergency, Business loan"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
                Annual Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                className="input w-full text-xs"
                placeholder="0 for interest-free"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>
          </div>

          {/* Expected Return Date */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
              Expected Repayment Date
            </label>
            <input
              type="date"
              className="input w-full text-xs"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
          </div>

          {/* Asset Info Callout */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-[var(--color-text-secondary)] flex items-start gap-2.5">
            <span className="text-emerald-400 text-base shrink-0 mt-0.5">💡</span>
            <div>
              <p className="font-bold text-emerald-400 mb-0.5">Increases Your Net Worth!</p>
              <p className="text-[11px] leading-relaxed">
                Money you lend is a receivable asset. Adding this record will automatically increase your Total Assets and Net Worth in real-time.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm px-5 font-bold shadow-md">
              ✓ Record Money Lent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
