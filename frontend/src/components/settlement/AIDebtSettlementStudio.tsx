"use client";

import React, { useState } from "react";

interface LoanOption {
  id: string;
  name: string;
  lender: string;
  principal: number;
  interestRate: number;
  monthlyEmi: number;
  category: string;
}

export function AIDebtSettlementStudio() {
  const [selectedLoan, setSelectedLoan] = useState<string>("loan-1");
  const [settlementPercent, setSettlementPercent] = useState<number>(75); // Pay 75%, get 25% discount
  const [proposalType, setProposalType] = useState<"lump_sum" | "rate_reduction" | "hardship">("lump_sum");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const sampleLoans: LoanOption[] = [
    {
      id: "loan-1",
      name: "Personal Flexi Loan",
      lender: "HDFC Bank",
      principal: 250000,
      interestRate: 14.5,
      monthlyEmi: 8500,
      category: "Personal Loan",
    },
    {
      id: "loan-2",
      name: "Premium Credit Card Balance",
      lender: "ICICI Bank",
      principal: 120000,
      interestRate: 36.0,
      monthlyEmi: 6000,
      category: "Credit Card",
    },
    {
      id: "loan-3",
      name: "Auto Loan",
      lender: "SBI",
      principal: 480000,
      interestRate: 9.2,
      monthlyEmi: 12400,
      category: "Vehicle Loan",
    },
  ];

  const activeLoan = sampleLoans.find((l) => l.id === selectedLoan) || sampleLoans[0];

  // Settlement calculations
  const settlementOfferAmount = Math.round(activeLoan.principal * (settlementPercent / 100));
  const directSavings = activeLoan.principal - settlementOfferAmount;
  const estimatedInterestSaved = Math.round(activeLoan.monthlyEmi * 12 * 0.4);
  const totalSavings = directSavings + estimatedInterestSaved;

  // AI Generated Proposal Templates
  const generateProposalText = () => {
    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (proposalType === "lump_sum") {
      return `To: The Loan Manager / Settlement Officer
${activeLoan.lender} — Credit & Risk Division
Date: ${dateStr}

Subject: Proposal for Full & Final One-Time Settlement — Account #${activeLoan.name} (Principal: ₹${activeLoan.principal.toLocaleString()})

Dear Manager,

I am writing regarding my active account (${activeLoan.name}) with an outstanding balance of ₹${activeLoan.principal.toLocaleString()}.

In light of financial reallocation, I am prepared to offer a One-Time Settlement (OTS) of ₹${settlementOfferAmount.toLocaleString()} (${settlementPercent}% of principal balance), payable immediately upon receipt of a written settlement agreement and NOC (No Objection Certificate).

Key Verification Credentials:
• Monad Blockchain ZK-Reputation Badge ID: PRF-2026-8841 (Verified Solvency Score)
• On-Chain Payment History: 100% Verified Track Record on DebtProof

Please confirm acceptance of this settlement offer within 14 calendar days so we may finalize the transaction and close the account.

Sincerely,
Abhimanyu Vaishnav
DebtProof Account Holder`;
    }

    if (proposalType === "rate_reduction") {
      return `To: Nodal Officer / Credit Card & Loan Department
${activeLoan.lender}
Date: ${dateStr}

Subject: Formal Request for Interest Rate Concession (Current Rate: ${activeLoan.interestRate}%)

Dear Credit Officer,

I have been a consistently compliant borrower maintaining an active loan (${activeLoan.name}) with an existing APR of ${activeLoan.interestRate}%.

Based on current market benchmarks and my verified cryptographic repayment score (backed by Monad Blockchain ZK Credit Badges), I formally request a reduction of my interest rate to ${(
        activeLoan.interestRate - 4.5
      ).toFixed(1)}% per annum or a balance transfer authorization.

Thank you for your prompt consideration.

Sincerely,
Abhimanyu Vaishnav`;
    }

    return `To: Debt Restructuring Cell
${activeLoan.lender}
Date: ${dateStr}

Subject: Application for Temporary EMI Hardship Relief & Extension

Dear Sir/Madam,

I am requesting a 6-month EMI restructuring plan for loan account (${activeLoan.name}) with an EMI of ₹${activeLoan.monthlyEmi.toLocaleString()}/month.

I request a temporary pause on interest capitalization for 90 days. All past payments remain verified on the Monad Blockchain registry.

Sincerely,
Abhimanyu Vaishnav`;
  };

  const currentProposal = generateProposalText();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentProposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Banner */}
      <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-6 md:p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              🤖 AI Debt Settlement Engine
            </span>
            <span className="text-xs text-[var(--color-text-tertiary)] font-mono font-bold">
              Monad ZK-Proof Enhanced
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
            AI Debt Settlement & Bank Negotiation Studio
          </h2>

          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-medium">
            Calculate lump-sum settlement discount savings, model single-payoff offers (10% - 40% principal discounts), and generate formal AI-crafted negotiation letters backed by Monad Blockchain ZK-Reputation badges.
          </p>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls & Calculator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target Liability Selection */}
          <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              1. Select Target Liability
            </h3>

            <div className="space-y-2">
              {sampleLoans.map((loan) => (
                <button
                  key={loan.id}
                  onClick={() => setSelectedLoan(loan.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    selectedLoan === loan.id
                      ? "bg-purple-500/15 border-purple-500/50 ring-1 ring-purple-500/30"
                      : "bg-[var(--color-surface-tertiary)] border-[var(--color-border-light)] hover:bg-[var(--color-surface-secondary)]"
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs block text-[var(--color-text-primary)]">
                      {loan.name}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">
                      {loan.lender} • {loan.interestRate}% APR
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{loan.principal.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Settlement Percentage Slider */}
          <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                2. One-Time Settlement Offer
              </h3>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-500/20 text-purple-600 dark:text-purple-400">
                {settlementPercent}% of Principal
              </span>
            </div>

            <input
              type="range"
              min="50"
              max="90"
              step="5"
              value={settlementPercent}
              onChange={(e) => setSettlementPercent(Number(e.target.value))}
              className="w-full h-2 bg-purple-200 dark:bg-purple-950 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />

            <div className="flex justify-between text-[10px] font-mono text-[var(--color-text-tertiary)]">
              <span>50% (Aggressive Settlement)</span>
              <span>75% (Standard OTS)</span>
              <span>90% (Mild Discount)</span>
            </div>

            {/* Calculations Result */}
            <div className="p-4 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border-light)] space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-tertiary)]">Original Principal:</span>
                <span className="font-bold">₹{activeLoan.principal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-tertiary)]">Settlement Offer:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  ₹{settlementOfferAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t border-[var(--color-border-light)] pt-2 text-sm font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">Direct Principal Discount:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  ₹{directSavings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Letter Proposal Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-6 rounded-2xl shadow-xl space-y-5">
            {/* Header & Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border-light)] pb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                  3. AI Negotiation Letter Studio
                </h3>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  Formal proposal customized for bank officers
                </p>
              </div>

              {/* Proposal Type Selector */}
              <div className="flex rounded-xl bg-[var(--color-surface-tertiary)] p-1 border border-[var(--color-border-light)] text-xs font-bold">
                <button
                  onClick={() => setProposalType("lump_sum")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    proposalType === "lump_sum"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  Lump-Sum Offer
                </button>
                <button
                  onClick={() => setProposalType("rate_reduction")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    proposalType === "rate_reduction"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  Rate Cut Request
                </button>
                <button
                  onClick={() => setProposalType("hardship")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    proposalType === "hardship"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  Hardship Pause
                </button>
              </div>
            </div>

            {/* Generated Proposal Box */}
            <div className="relative">
              <textarea
                readOnly
                value={currentProposal}
                rows={16}
                className="w-full p-4 rounded-xl bg-slate-950 text-slate-200 border border-purple-500/30 font-mono text-xs leading-relaxed focus:outline-none select-all"
              />

              {/* Badges Overlay */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  ⚡ Monad ZK Credentials Embedded
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[var(--color-text-tertiary)] font-mono">
                Ready to send via email or registered post
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopy}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
                >
                  {copied ? "Proposal Copied! ✓" : "Copy Proposal Text 📋"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
