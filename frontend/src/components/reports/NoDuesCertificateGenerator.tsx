"use client";

import React, { useState } from "react";
import { FileCheck, Download, Printer, ShieldCheck, Sparkles, CheckCircle2, QrCode, Building2 } from "lucide-react";

interface CertificateLoan {
  id: string;
  loanName: string;
  lender: string;
  principal: number;
  paidOffDate: string;
  certificateId: string;
  sha256Proof: string;
}

const CLOSED_LOANS: CertificateLoan[] = [
  {
    id: "loan-c-1",
    loanName: "HDFC Personal Loan #9081",
    lender: "HDFC Bank Ltd",
    principal: 350000,
    paidOffDate: "15 June 2026",
    certificateId: "NDC-HDFC-2026-88192",
    sha256Proof: "0x8f192b49c71a3028d7162e7182e91029c",
  },
  {
    id: "loan-c-2",
    loanName: "SBI Express Car Loan",
    lender: "State Bank of India",
    principal: 620000,
    paidOffDate: "28 May 2026",
    certificateId: "NDC-SBI-2026-77310",
    sha256Proof: "0x3e182f091c7810a72b6102a90182741b0",
  },
];

export function NoDuesCertificateGenerator() {
  const [selectedLoan, setSelectedLoan] = useState<CertificateLoan>(CLOSED_LOANS[0]);
  const [showCertificate, setShowCertificate] = useState(false);

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <FileCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Official Bank-Grade No Dues & Loan Clearance Certificate Generator
            </h3>
            <p className="text-xs text-slate-400">
              Generate printable, digitally sealed No Dues Certificates with embedded Monad cryptographic QR verification
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCertificate(!showCertificate)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" /> {showCertificate ? "Close Preview" : "📄 Generate & Preview Certificate"}
        </button>
      </div>

      {/* Select Closed Loan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
        <div>
          <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Select Closed Loan Account</span>
          <div className="flex gap-2 flex-wrap">
            {CLOSED_LOANS.map((loan) => (
              <button
                key={loan.id}
                onClick={() => {
                  setSelectedLoan(loan);
                  setShowCertificate(true);
                }}
                className={`px-3 py-2 rounded-lg font-bold border transition ${
                  selectedLoan.id === loan.id
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                ✅ {loan.loanName}
              </button>
            ))}
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-slate-400 font-mono block">Certificate ID</span>
          <span className="text-emerald-400 font-bold font-mono">{selectedLoan.certificateId}</span>
        </div>
      </div>

      {/* Certificate Print Preview */}
      {showCertificate && (
        <div className="bg-white text-slate-900 rounded-2xl p-8 border-4 border-emerald-600/30 space-y-6 shadow-2xl animate-fadeIn">
          {/* Bank Header Strip */}
          <div className="flex justify-between items-start border-b-2 border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-emerald-700" />
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">
                  NO DUES & FULL LOAN PAYOFF CERTIFICATE
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-semibold">
                Issued under DebtProof Monad Cryptographic Verification Standards
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-slate-500 block">Date of Issue: {selectedLoan.paidOffDate}</span>
              <span className="text-xs font-mono font-bold text-emerald-700">Ref: {selectedLoan.certificateId}</span>
            </div>
          </div>

          {/* Certificate Content */}
          <div className="space-y-4 text-xs leading-relaxed text-slate-700 font-medium">
            <p>
              This is to officially certify that the loan account details specified below have been paid off in full with <b>ZERO outstanding principal or interest balance</b> remaining as of <b>{selectedLoan.paidOffDate}</b>.
            </p>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Loan Title</span>
                <span className="font-bold text-slate-900">{selectedLoan.loanName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Lender Institution</span>
                <span className="font-bold text-slate-900">{selectedLoan.lender}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Total Principal Paid</span>
                <span className="font-bold text-slate-900">₹{selectedLoan.principal.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Status</span>
                <span className="font-black text-emerald-700">CLOSED & SATISFIED ✅</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Cryptographic Proof Hash: <code className="font-mono text-slate-800 font-bold">{selectedLoan.sha256Proof}</code> (Anchored on Monad Testnet).
            </p>
          </div>

          {/* Footer Seals & Verification */}
          <div className="flex justify-between items-center pt-4 border-t-2 border-slate-200 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center">
                <QrCode className="w-12 h-12 text-slate-800" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Scan to Verify On-Chain</span>
                <span className="text-[10px] text-slate-500 font-mono">http://localhost:3000/verify/{selectedLoan.certificateId}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="w-32 h-10 border-b-2 border-slate-800 mb-1 flex items-end justify-center font-serif text-slate-800 italic font-bold">
                DebtProof Signatory
              </div>
              <span className="text-[10px] font-bold text-slate-600 block uppercase">Authorized Digital Seal</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={handlePrintCertificate}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
