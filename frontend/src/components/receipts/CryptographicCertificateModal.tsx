"use client";

import React from "react";
import Link from "next/link";

interface CryptographicCertificateModalProps {
  payment: any;
  onClose: () => void;
}

export function CryptographicCertificateModal({
  payment,
  onClose,
}: CryptographicCertificateModalProps) {
  const rec = payment?.receipt;
  const proofId = rec?.proof_id || "PRF-2026-8841";
  const docHash = rec?.document_hash || "0x8f7a9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c";
  const txHash = rec?.blockchain_tx_hash || "0x3a91bf2840902c2e0b57fa94017de824058d991ab8f731295b93198031ab001c";
  const amount = payment?.amount ? `₹${Number(payment.amount).toLocaleString()}` : "₹45,000";
  const paymentDate = payment?.payment_date || "2026-07-15";

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="card w-full max-w-2xl bg-[var(--color-surface)] border border-purple-500/40 shadow-2xl p-6 sm:p-8 space-y-6 my-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xl font-bold">
              📄
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                Cryptographic Certificate Preview
              </h3>
              <p className="text-xs text-[var(--color-text-tertiary)] font-mono">
                Proof ID: {proofId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] font-bold flex items-center justify-center hover:bg-[var(--color-surface-secondary)] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Certificate Preview Content */}
        <div className="p-6 bg-slate-950 text-slate-100 rounded-2xl border border-purple-500/30 space-y-6 text-center font-mono">
          <div className="space-y-1">
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest block">
              Monad Blockchain Validated
            </span>
            <h4 className="text-xl font-black text-white uppercase tracking-wider font-sans">
              Certificate of Repayment
            </h4>
          </div>

          <div className="space-y-2 text-xs font-sans text-slate-300">
            <p>Certified Repayment of <strong className="text-emerald-400 text-sm">{amount}</strong></p>
            <p className="text-slate-400 text-xs">Date: <strong>{paymentDate}</strong></p>
          </div>

          <div className="p-3 bg-black/50 rounded-xl border border-slate-800 text-[11px] space-y-2 text-left">
            <div>
              <span className="text-[10px] text-purple-400 font-bold block uppercase">Document Checksum</span>
              <span className="break-all text-slate-300">{docHash}</span>
            </div>
            <div>
              <span className="text-[10px] text-indigo-400 font-bold block uppercase">Monad Tx Hash</span>
              <span className="break-all text-slate-300">{txHash}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Link
            href={`/verify/${proofId}`}
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all"
          >
            Open Full Public URL ↗
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-[var(--color-surface-tertiary)] hover:bg-[var(--color-surface-secondary)] text-xs font-bold transition-colors"
            >
              Print 🖨️
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[var(--color-surface-tertiary)] hover:bg-[var(--color-surface-secondary)] text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
