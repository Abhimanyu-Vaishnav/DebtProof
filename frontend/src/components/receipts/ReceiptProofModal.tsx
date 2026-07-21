"use client";

import React from "react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Payment } from "@/types";

interface ReceiptProofModalProps {
  payment: Payment;
  onClose: () => void;
}

export function ReceiptProofModal({ payment, onClose }: ReceiptProofModalProps) {
  const rec = payment.receipt;
  if (!rec) return null;

  const isVerified = rec.is_blockchain_verified;
  const txHash = rec.blockchain_tx_hash || `0x${rec.document_hash.slice(0, 40)}`;
  const explorerUrl = `https://testnet.monadsv.com/tx/${txHash}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="card w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border-light)] shadow-2xl p-6 space-y-5 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⛓️</span>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Monad On-Chain Proof Inspector</h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">Immutable SHA-256 Ledger Record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] font-bold flex items-center justify-center hover:bg-[var(--color-surface-secondary)]"
          >
            ✕
          </button>
        </div>

        {/* Status Badge */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          isVerified
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{isVerified ? "✅" : "⏳"}</span>
            <div>
              <span className="font-extrabold text-sm block">
                {isVerified ? "Monad Testnet Verified" : "Pending On-Chain Anchor"}
              </span>
              <span className="text-[10px] opacity-80 block">Chain ID: 10143 (Monad Testnet)</span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-black/20">
            {isVerified ? "CONFIRMED" : "QUEUED"}
          </span>
        </div>

        {/* Cryptographic Hash Breakdown */}
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-tertiary)] block">Payment Reference</span>
              <span className="font-bold text-[var(--color-text-primary)]">{payment.loan_name} — {formatCurrency(parseFloat(payment.amount))}</span>
              <span className="text-[10px] text-[var(--color-text-tertiary)] block">Paid on {formatDate(payment.payment_date)}</span>
            </div>

            <div className="pt-2 border-t border-[var(--color-border-light)]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-tertiary)] block">Original Document</span>
              <span className="font-mono text-[var(--color-primary-light)] font-bold truncate block">{rec.original_filename}</span>
            </div>

            <div className="pt-2 border-t border-[var(--color-border-light)]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-tertiary)] block">SHA-256 Digest Fingerprint</span>
              <p className="font-mono text-[var(--color-text-secondary)] break-all bg-[var(--color-surface-tertiary)] p-2 rounded-lg text-[11px] mt-0.5 border border-[var(--color-border-light)]">
                {rec.document_hash}
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--color-border-light)]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-tertiary)] block">Transaction Hash (Tx)</span>
              <p className="font-mono text-[var(--color-accent)] break-all text-[11px] mt-0.5">
                {txHash}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm px-4 py-2 text-xs font-bold w-full justify-center flex items-center gap-1.5"
          >
            <span>🔗</span> Open Monad Explorer
          </a>
        </div>
      </div>
    </div>
  );
}
