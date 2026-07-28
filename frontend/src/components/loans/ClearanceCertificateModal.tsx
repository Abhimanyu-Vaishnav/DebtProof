"use client";

import React from "react";

interface CertificateData {
  certificate_id: string;
  issue_date: string;
  borrower_name: string;
  borrower_email: string;
  lender_name: string;
  loan_name: string;
  loan_type: string;
  principal_amount: number;
  total_repaid: number;
  status: string;
  is_cleared: boolean;
  blockchain_network: string;
  blockchain_tx_hash: string;
  verification_url: string;
}

interface ClearanceCertificateModalProps {
  cert: CertificateData | null;
  onClose: () => void;
}

export function ClearanceCertificateModal({ cert, onClose }: ClearanceCertificateModalProps) {
  if (!cert) return null;

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl shadow-emerald-950/30 space-y-6 relative overflow-hidden">
        {/* Decorative Watermark */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Actions */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Official Debt Clearance Certificate</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              🖨️ Print Certificate
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition flex items-center justify-center text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Certificate Body Container */}
        <div id="printable-certificate" className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-emerald-500/30 space-y-6 text-center relative">
          {/* Official Stamp Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black uppercase tracking-widest">
            🛡️ CERTIFIED ZERO-DEBT SETTLEMENT
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">CERTIFICATE OF FULL DEBT DISCHARGE</h2>
            <p className="text-xs text-slate-400 font-mono">Certificate ID: {cert.certificate_id}</p>
          </div>

          <div className="py-4 border-y border-slate-800/80 space-y-3 text-xs text-slate-300 leading-relaxed max-w-lg mx-auto">
            <p>
              This is to officially certify that <strong className="text-white font-bold">{cert.borrower_name}</strong> ({cert.borrower_email}) has successfully completed full repayment of the loan obligation listed below:
            </p>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-2 gap-2 text-left">
              <div><span className="text-slate-500">Loan Facility:</span> <span className="font-bold text-white block">{cert.loan_name}</span></div>
              <div><span className="text-slate-500">Lender Institution:</span> <span className="font-bold text-white block">{cert.lender_name}</span></div>
              <div><span className="text-slate-500">Principal Disbursed:</span> <span className="font-bold text-rose-400 block">{fmt(cert.principal_amount)}</span></div>
              <div><span className="text-slate-500">Total Settled:</span> <span className="font-bold text-emerald-400 block">{fmt(cert.total_repaid)}</span></div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              All principal and interest obligations for this contract have been satisfied in full with zero outstanding balance.
            </p>
          </div>

          {/* Monad Blockchain Verification Block */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                <span>🔗</span> Immutable Blockchain Proof (Monad Network)
              </span>
              <span className="text-[9px] text-slate-500 font-mono">Issued: {cert.issue_date}</span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 break-all bg-slate-900 p-2 rounded-lg border border-slate-800">
              Tx Hash: {cert.blockchain_tx_hash}
            </p>
          </div>

          {/* Footer Seal & Signature */}
          <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400 border-t border-slate-800/60">
            <div className="text-left">
              <p className="font-bold text-slate-300">DebtProof Protocol Compliance</p>
              <p>Cryptographic Proof & Settlement Division</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-emerald-400 font-bold">STATUS: DISCHARGED & CLEARED</p>
              <p>Monad Chain ID 10143</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
