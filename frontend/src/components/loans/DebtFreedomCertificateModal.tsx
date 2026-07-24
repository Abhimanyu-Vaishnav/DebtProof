"use client";

import React from "react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Loan } from "@/types";

interface DebtFreedomCertificateModalProps {
  loan: Loan;
  onClose: () => void;
}

export function DebtFreedomCertificateModal({ loan, onClose }: DebtFreedomCertificateModalProps) {
  const principal = parseFloat(loan.principal_amount) || 0;
  const issueDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const printCertificate = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="w-full max-w-3xl bg-white text-slate-900 border-8 border-amber-400 rounded-3xl shadow-2xl p-8 sm:p-12 space-y-6 my-auto relative print:m-0 print:shadow-none">
        
        {/* Close Button (Hidden on Print) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer print:hidden"
        >
          ✕
        </button>

        {/* Outer Certificate Frame Header */}
        <div className="text-center space-y-3 border-b-2 border-amber-300 pb-6">
          <div className="inline-block p-3 rounded-full bg-amber-100 text-amber-600 text-4xl mb-2">
            🏆
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-wider text-slate-900 uppercase">
            Certificate of Debt Freedom
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-widest text-amber-600 uppercase">
            Official Non-Liable Financial Settlement
          </p>
        </div>

        {/* Certificate Body */}
        <div className="text-center space-y-5 py-4">
          <p className="text-sm text-slate-600 font-serif italic">This official certificate is proudly presented to confirm that</p>
          
          <div className="py-2 border-b-2 border-slate-300 max-w-md mx-auto">
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {loan.user || "Valued Account Holder"}
            </h2>
          </div>

          <p className="text-xs sm:text-base text-slate-700 leading-relaxed font-serif max-w-xl mx-auto">
            has successfully repaid 100% of the financial obligation for <strong className="text-slate-900 font-sans">{loan.name}</strong> issued by <strong className="text-slate-900 font-sans">{loan.lender_name || "Lending Institution"}</strong>. All principal balance of <strong className="text-emerald-700 font-sans">{formatCurrency(principal)}</strong> has been settled with zero outstanding liability remaining.
          </p>
        </div>

        {/* Key Attributes Grid */}
        <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Loan Account</span>
            <span className="font-extrabold text-slate-900">{loan.account_number || loan.id.slice(0, 10)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Settlement Status</span>
            <span className="font-black text-emerald-600 uppercase">CLOSED & PAID</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Issue Date</span>
            <span className="font-extrabold text-slate-900">{issueDate}</span>
          </div>
        </div>

        {/* Seal & Signature Footer */}
        <div className="flex items-center justify-between pt-6 border-t-2 border-slate-200 text-xs">
          <div className="text-center">
            <div className="font-serif italic font-bold text-slate-800 text-sm border-b border-slate-400 pb-1 px-4">
              DebtProof Automated Registry
            </div>
            <span className="text-[10px] text-slate-500 block mt-1 font-bold">Cryptographic Ledger Seal</span>
          </div>

          {/* Gold Emblem */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-white flex items-center justify-center font-black shadow-lg border-2 border-amber-200">
            <span className="text-xs text-center leading-tight">100%<br/>PAID</span>
          </div>

          <div className="text-center">
            <div className="font-mono font-bold text-slate-800 text-sm border-b border-slate-400 pb-1 px-4">
              Monad Testnet Anchored
            </div>
            <span className="text-[10px] text-slate-500 block mt-1 font-bold">Chain ID: 10143 Verified</span>
          </div>
        </div>

        {/* Actions (Hidden on Print) */}
        <div className="flex items-center gap-3 pt-4 print:hidden">
          <button
            onClick={printCertificate}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
          >
            <span>🖨️</span> Print / Download PDF Certificate
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
