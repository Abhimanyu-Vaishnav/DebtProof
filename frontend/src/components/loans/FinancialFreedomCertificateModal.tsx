"use client";

import React from "react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Loan } from "@/types";

interface FinancialFreedomCertificateModalProps {
  loan: Loan;
  onClose: () => void;
}

export function FinancialFreedomCertificateModal({ loan, onClose }: FinancialFreedomCertificateModalProps) {
  const handlePrint = () => window.print();

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl my-auto">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-4 print:hidden">
          <h2 className="text-base font-bold text-white">🏆 Financial Freedom Certificate</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm px-4 font-bold text-xs"
            >
              🖨️ Print / Download PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 text-white font-bold flex items-center justify-center hover:bg-white/30"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Certificate */}
        <div className="bg-white rounded-2xl p-10 shadow-2xl border-8 border-double border-amber-400 relative overflow-hidden print:border-amber-400 print:rounded-2xl">
          {/* Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
            <span className="text-[180px] font-black text-amber-500 rotate-[-25deg]">🏆</span>
          </div>

          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-3xl">🏆</span>
              <span className="text-3xl font-black text-amber-500 tracking-wide">DebtProof</span>
              <span className="text-3xl">🏆</span>
            </div>
            <div className="h-0.5 w-48 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4" />
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-widest uppercase">
              Certificate of Financial Freedom
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">This is to certify that</p>
          </div>

          {/* Recipient */}
          <div className="text-center mb-8 relative z-10">
            <p className="text-xl font-black text-slate-800 border-b-2 border-dashed border-amber-300 pb-2 px-8 inline-block">
              DebtProof Account Holder
            </p>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed max-w-md mx-auto">
              has successfully repaid and closed the following loan account in full,
              achieving a significant milestone toward total financial freedom.
            </p>
          </div>

          {/* Loan Details */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 relative z-10">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Loan Account</span>
                <span className="font-bold text-slate-800">{loan.name}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Lender</span>
                <span className="font-bold text-slate-800">{loan.lender_name}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Original Principal</span>
                <span className="font-bold text-slate-800">{formatCurrency(parseFloat(loan.principal_amount))}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Total Repaid</span>
                <span className="font-bold text-emerald-700">{formatCurrency(parseFloat(loan.paid_amount))}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Loan Start</span>
                <span className="font-bold text-slate-800">{formatDate(loan.start_date)}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Completion Date</span>
                <span className="font-bold text-emerald-700">{today}</span>
              </div>
            </div>
          </div>

          {/* Seal & Signature */}
          <div className="flex items-center justify-between relative z-10 border-t border-dashed border-amber-300 pt-5">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full border-4 border-amber-400 flex items-center justify-center mx-auto mb-1 bg-amber-50">
                <span className="text-2xl">✅</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Verified</span>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 italic mb-1">Issued on {today}</p>
              <p className="text-base font-black text-amber-500 tracking-wider">DebtProof</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest">by Sanatan Labs</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full border-4 border-emerald-400 flex items-center justify-center mx-auto mb-1 bg-emerald-50">
                <span className="text-2xl">🎉</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Debt Free!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
