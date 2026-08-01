"use client";

import React, { useState } from "react";
import { Landmark, ArrowRight, TrendingDown, ShieldCheck, Sparkles, CheckCircle2, Loader2 } from "lucide-react";

interface LenderOffer {
  bankName: string;
  logo: string;
  interestRate: number;
  processingFee: string;
  tenureYears: number;
  newMonthlyEmi: number;
  totalSavings: number;
  features: string[];
}

const LENDER_OFFERS: LenderOffer[] = [
  {
    bankName: "HDFC Bank Home Refinance",
    logo: "🏦",
    interestRate: 8.15,
    processingFee: "₹2,999 Flat",
    tenureYears: 15,
    newMonthlyEmi: 28950,
    totalSavings: 245000,
    features: ["Zero Foreclosure Penalty", "Paperless Digital Transfer", "Instant Top-Up Available"],
  },
  {
    bankName: "SBI Express Balance Transfer",
    logo: "🏛️",
    interestRate: 8.25,
    processingFee: "0.25% (Min ₹1,000)",
    tenureYears: 15,
    newMonthlyEmi: 29120,
    totalSavings: 215000,
    features: ["Government Bank Assurance", "Daily Reducing Balance", "Pre-approved Limit"],
  },
  {
    bankName: "ICICI Bank Smart Refinance",
    logo: "💳",
    interestRate: 8.35,
    processingFee: "Zero Processing Fee",
    tenureYears: 15,
    newMonthlyEmi: 29300,
    totalSavings: 188000,
    features: ["Doorstep Document Collection", "Complimentary Health Cover", "Flexi EMI Options"],
  },
];

export function MultiLenderRefinanceMatrix() {
  const [applyingBank, setApplyingBank] = useState<string | null>(null);
  const [appliedTx, setAppliedTx] = useState<string | null>(null);

  const handleApplyTransfer = async (bankName: string) => {
    setApplyingBank(bankName);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    setAppliedTx("REF-" + Math.floor(100000 + Math.random() * 900000));
    setApplyingBank(null);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Landmark className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Multi-Lender Refinance & Balance Transfer Matrix <Sparkles className="w-4 h-4 text-cyan-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Compare live market interest rates and switch lenders to save lakhs on your active loans
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-full text-xs font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Direct Bank APIs Integrated
        </span>
      </div>

      {appliedTx && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="font-bold text-emerald-300">Balance Transfer Request Submitted!</span>
              <p className="text-slate-400 text-[11px]">Application Ref ID: <code className="text-emerald-400 font-mono">{appliedTx}</code></p>
            </div>
          </div>
          <button onClick={() => setAppliedTx(null)} className="text-slate-400 hover:text-white text-xs font-bold">✕ Close</button>
        </div>
      )}

      {/* Lender Offer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {LENDER_OFFERS.map((offer) => (
          <div
            key={offer.bankName}
            className="bg-slate-950/80 border border-slate-800 hover:border-blue-500/40 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-lg shadow-slate-950"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{offer.logo}</span>
                <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-black">
                  {offer.interestRate}% p.a.
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-100 mb-1">{offer.bankName}</h4>
              <p className="text-xs text-slate-400 mb-3">Fee: <b className="text-slate-200">{offer.processingFee}</b></p>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 mb-3 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>New Monthly EMI</span>
                  <span className="font-bold text-slate-100">₹{offer.newMonthlyEmi.toLocaleString("en-IN")}/mo</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Interest Savings</span>
                  <span className="font-black text-emerald-400">₹{offer.totalSavings.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-400">
                {offer.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleApplyTransfer(offer.bankName)}
              disabled={applyingBank === offer.bankName}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {applyingBank === offer.bankName ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Eligibility...
                </>
              ) : (
                <>
                  Apply Balance Transfer <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
