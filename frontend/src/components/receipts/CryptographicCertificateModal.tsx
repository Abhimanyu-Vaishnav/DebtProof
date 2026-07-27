"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/utils/formatters";

interface CryptographicCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certData: {
    title: string;
    description: string;
    amount?: number | string;
    sha256Hash: string;
    proofId: string;
    merkleRoot?: string;
    blockNumber?: number;
    txHash?: string;
    timestamp?: string;
  };
}

export function CryptographicCertificateModal({ isOpen, onClose, certData }: CryptographicCertificateModalProps) {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handlePrintDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.print();
      }
      setDownloading(false);
    }, 500);
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    `https://testnet.monadscan.com/tx/${certData.txHash || certData.sha256Hash}`
  )}`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[110] animate-fade-in">
      <div className="card w-full max-w-2xl bg-[var(--color-surface)] border-2 border-purple-500/40 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Certificate Header Banner */}
        <div className="flex items-center justify-between border-b-2 border-purple-500/20 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/40 flex items-center justify-center text-2xl font-bold shadow-inner">
              📜
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 uppercase tracking-widest">
                Official Web3 Cryptographic Certificate
              </span>
              <h2 className="text-xl font-black text-[var(--color-text-primary)] mt-0.5">
                {certData.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Certificate Body */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/5 via-[var(--color-surface-secondary)] to-indigo-500/5 border border-purple-500/30 space-y-6 relative">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-md">
              <span className="text-xs font-mono text-[var(--color-text-tertiary)] uppercase font-bold">Assertion Statement</span>
              <p className="text-sm font-bold text-[var(--color-text-primary)] leading-relaxed">
                {certData.description}
              </p>
              {certData.amount && (
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono pt-1">
                  Valuation / Amount: {formatCurrency(Number(certData.amount))}
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className="p-2 bg-white rounded-xl shadow-md border shrink-0 text-center space-y-1">
              <img src={qrUrl} alt="Monad Verification QR Code" className="w-24 h-24 object-contain mx-auto" />
              <span className="text-[9px] font-mono font-bold text-gray-700 block">Monad Scan Verified</span>
            </div>
          </div>

          {/* Hashes & Roots Grid */}
          <div className="space-y-3 font-mono text-xs border-t border-purple-500/20 pt-4">
            <div>
              <span className="text-[10px] text-[var(--color-text-tertiary)] font-black uppercase block tracking-wider mb-1">
                SHA-256 Checksum Hash
              </span>
              <div className="p-2.5 rounded-xl bg-slate-950 text-purple-300 border border-purple-500/30 font-bold break-all select-all">
                {certData.sha256Hash}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-[var(--color-text-tertiary)] font-black uppercase block tracking-wider mb-1">
                  Proof Certificate ID
                </span>
                <div className="p-2.5 rounded-xl bg-slate-950 text-indigo-300 border border-purple-500/30 font-bold truncate">
                  {certData.proofId}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-[var(--color-text-tertiary)] font-black uppercase block tracking-wider mb-1">
                  Blockchain Anchor Target
                </span>
                <div className="p-2.5 rounded-xl bg-slate-950 text-emerald-300 border border-purple-500/30 font-bold truncate">
                  Monad Testnet (Chain 10143)
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-text-tertiary)]">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              ⚖️ Court-Admissible Affidavit Pack
            </span>
            <span>Tamper-proof cryptographic record</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handlePrintDownload}
              disabled={downloading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/25 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{downloading ? "Preparing Affidavit..." : "📥 Export Court Affidavit Pack PDF"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CryptographicCertificateModal;
