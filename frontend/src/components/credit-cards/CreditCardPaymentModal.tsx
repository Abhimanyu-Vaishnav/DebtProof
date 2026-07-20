"use client";

import React, { useState } from "react";
import type { CreditCard } from "@/types";
import { creditCardsService } from "@/services/credit-cards.service";

interface CreditCardPaymentModalProps {
  card: CreditCard;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreditCardPaymentModal({ card, isOpen, onClose, onSuccess }: CreditCardPaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    if (amountVal > card.current_outstanding) {
      setError(`Payment cannot exceed current outstanding (₹${card.current_outstanding.toFixed(2)}).`);
      return;
    }

    setLoading(true);
    try {
      await creditCardsService.createPayment({
        card: card.id,
        amount: amountVal.toFixed(2),
        payment_date: paymentDate,
        payment_method: paymentMethod,
        reference_number: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.amount?.[0] || err.response?.data?.error?.message || "Failed to record payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-md p-6 shadow-2xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-[var(--color-text-primary)]">Record Card Payment</h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{card.card_name} — Outstanding: ₹{card.current_outstanding}</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-xs text-[var(--color-error)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Amount Paid (₹)</label>
              <input
                type="number"
                step="0.01"
                className="input w-full"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Date</label>
              <input
                type="date"
                className="input w-full"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Method</label>
              <select
                className="input w-full h-10 py-1"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="neft">NEFT</option>
                <option value="rtgs">RTGS</option>
                <option value="cheque">Cheque</option>
                <option value="auto_debit">Auto Debit</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Ref / UTR No.</label>
              <input
                type="text"
                className="input w-full"
                placeholder="Optional ID"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Notes</label>
            <textarea
              className="input w-full h-16 py-1.5"
              placeholder="Optional payment notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm flex items-center gap-1.5"
              disabled={loading}
            >
              {loading ? "Recording..." : "Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
