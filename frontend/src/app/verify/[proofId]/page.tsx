"use client";

import React, { use } from "react";
import Link from "next/link";

interface CertificatePageProps {
  params: Promise<{
    proofId: string;
  }>;
}

export default function CertificatePage({ params }: CertificatePageProps) {
  const resolvedParams = use(params);
  const proofId = resolvedParams.proofId || "PRF-2026-8841";

  // Mock certificate details
  const certData = {
    proofId: proofId,
    borrowerName: "Abhimanyu Vaishnav",
    lenderName: "HDFC Bank (Loan #4029)",
    repaymentAmount: "₹45,000",
    paymentDate: "July 15, 2026",
    documentHash: "0x8f7a9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c",
    txHash: "0x3a91bf2840902c2e0b57fa94017de824058d991ab8f731295b93198031ab001c",
    blockNumber: "1,482,904",
    network: "Monad Testnet (Chain ID 10143)",
    issuedAt: "2026-07-15 14:32:10 UTC",
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const verificationUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify-proof`
    : `https://debt-proof-front-tau.vercel.app/verify-proof`;

  // Dynamic SVG QR code representation
  const qrSvg = (
    <svg viewBox="0 0 100 100" className="w-24 h-24 bg-white p-1 rounded-lg border border-gray-300">
      <rect width="100" height="100" fill="white" />
      <path d="M10 10h30v30h-30z M15 15h20v20h-20z M20 20h10v10h-10z" fill="black" />
      <path d="M60 10h30v30h-30z M65 15h20v20h-20z M70 20h10v10h-10z" fill="black" />
      <path d="M10 60h30v30h-30z M15 65h20v20h-20z M20 70h10v10h-10z" fill="black" />
      <path d="M50 50h10v10h-10z M70 50h10v10h-10z M50 70h10v10h-10z M80 70h10v10h-10z M60 80h20v10h-20z" fill="black" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] p-4 sm:p-8 font-sans antialiased text-[var(--color-text-primary)]">
      {/* Top action bar (hidden when printing) */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/verify-proof"
          className="text-xs font-bold text-[var(--color-text-secondary)] hover:text-purple-500 transition-colors flex items-center gap-1"
        >
          ← Back to Verifier
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
          >
            🖨️ Print / Save PDF
          </button>
        </div>
      </div>

      {/* Official Certificate Card */}
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-4 border-purple-600/30 rounded-3xl p-6 sm:p-12 shadow-2xl space-y-8 relative overflow-hidden print:shadow-none print:border-2">
        {/* Certificate Watermark Background */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Certificate Header */}
        <div className="text-center space-y-3 border-b-2 border-slate-200 dark:border-slate-800 pb-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <span>🛡️ DEBTPROOF CRYPTOGRAPHIC VERIFICATION</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-purple-700 dark:text-purple-400">
            Certificate of Repayment
          </h1>

          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
            PROOF ID: <span className="font-bold text-slate-800 dark:text-slate-200">{certData.proofId}</span>
          </p>
        </div>

        {/* Certificate Main Body */}
        <div className="space-y-6 text-center sm:text-left relative z-10">
          <p className="text-xs uppercase font-bold text-slate-400 tracking-widest text-center">
            This document officially certifies that
          </p>

          <h2 className="text-2xl sm:text-3xl font-black text-center text-slate-900 dark:text-white underline decoration-purple-500/40 decoration-4">
            {certData.borrowerName}
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 text-center leading-relaxed max-w-xl mx-auto">
            has successfully executed a verifiable loan repayment of{" "}
            <strong className="text-emerald-600 dark:text-emerald-400 text-base">{certData.repaymentAmount}</strong> to{" "}
            <strong className="text-slate-800 dark:text-slate-100">{certData.lenderName}</strong> on{" "}
            <strong>{certData.paymentDate}</strong>.
          </p>

          {/* Key Facts Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs font-mono">
            <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase">Repayment Amount</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-sans">{certData.repaymentAmount}</span>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase">Payment Date</span>
              <span className="font-bold font-sans">{certData.paymentDate}</span>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase">Block Number</span>
              <span className="font-bold">{certData.blockNumber}</span>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase">Status</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">IMMUTABLE</span>
            </div>
          </div>

          {/* Hashes */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase text-purple-600 font-bold block">SHA-256 Checksum Hash</span>
              <span className="break-all text-slate-700 dark:text-slate-300">{certData.documentHash}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase text-indigo-600 font-bold block">Monad Testnet Transaction Hash</span>
              <span className="break-all text-slate-700 dark:text-slate-300">{certData.txHash}</span>
            </div>
          </div>
        </div>

        {/* Footer & QR Code */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t-2 border-slate-200 dark:border-slate-800 pt-6 relative z-10">
          <div className="space-y-1 text-center sm:text-left text-xs font-mono">
            <span className="text-purple-600 dark:text-purple-400 font-bold block">Monad Blockchain Ledger</span>
            <span className="text-slate-500 text-[11px] block">Issued: {certData.issuedAt}</span>
            <span className="text-slate-400 text-[10px] block">Chain ID: 10143 • Monad Testnet</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block text-[11px] font-mono text-slate-400">
              <span>Scan QR to verify</span>
              <br />
              <span className="text-[9px] text-purple-500">{verificationUrl}</span>
            </div>
            {qrSvg}
          </div>
        </div>
      </div>
    </div>
  );
}
