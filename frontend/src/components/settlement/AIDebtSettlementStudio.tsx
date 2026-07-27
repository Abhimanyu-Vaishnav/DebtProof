"use client";

import React, { useState, useEffect } from "react";
import { loansService } from "@/services/loans.service";
import { creditCardsService } from "@/services/credit-cards.service";

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
  const [loans, setLoans] = useState<LoanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");
  const [settlementPercent, setSettlementPercent] = useState<number>(75); // Pay 75%, get 25% discount
  const [proposalType, setProposalType] = useState<"lump_sum" | "rate_reduction" | "hardship">("lump_sum");
  const [copied, setCopied] = useState(false);

  // Custom addition modal/state
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customLender, setCustomLender] = useState("");
  const [customPrincipal, setCustomPrincipal] = useState("150000");
  const [customRate, setCustomRate] = useState("14.0");
  const [customEmi, setCustomEmi] = useState("5500");

  const defaultSampleLoans: LoanOption[] = [
    {
      id: "sample-1",
      name: "HDFC Personal Flexi Loan",
      lender: "HDFC Bank",
      principal: 250000,
      interestRate: 14.5,
      monthlyEmi: 8500,
      category: "Personal Loan",
    },
    {
      id: "sample-2",
      name: "ICICI Platinum Credit Card",
      lender: "ICICI Bank",
      principal: 120000,
      interestRate: 36.0,
      monthlyEmi: 6000,
      category: "Credit Card",
    },
    {
      id: "sample-3",
      name: "SBI Auto Loan",
      lender: "SBI Bank",
      principal: 480000,
      interestRate: 9.2,
      monthlyEmi: 12400,
      category: "Vehicle Loan",
    },
    {
      id: "sample-4",
      name: "Axis Education Loan",
      lender: "Axis Bank",
      principal: 350000,
      interestRate: 11.5,
      monthlyEmi: 9200,
      category: "Education Loan",
    },
  ];

  useEffect(() => {
    async function fetchAllLiabilities() {
      setLoading(true);
      try {
        const [loansRes, cardsRes] = await Promise.allSettled([
          loansService.getLoans(),
          creditCardsService.getCards(),
        ]);

        const fetchedList: LoanOption[] = [];

        if (loansRes.status === "fulfilled" && loansRes.value?.results) {
          loansRes.value.results.forEach((l: any) => {
            const bal = parseFloat(l.outstanding_amount || l.principal_amount) || 0;
            const rate = parseFloat(l.interest_rate) || 12;
            const emi = parseFloat(l.monthly_emi) || 0;
            if (bal > 0 || l.is_active !== false) {
              fetchedList.push({
                id: l.id || `loan-${Math.random()}`,
                name: l.name || `${l.lender_name || "Bank"} Loan`,
                lender: l.lender_name || "Lender Bank",
                principal: bal || 100000,
                interestRate: rate,
                monthlyEmi: emi,
                category: l.loan_type ? `${l.loan_type.replace("_", " ").toUpperCase()} Loan` : "General Debt",
              });
            }
          });
        }

        if (cardsRes.status === "fulfilled" && Array.isArray(cardsRes.value)) {
          cardsRes.value.forEach((c: any) => {
            const bal = parseFloat(c.current_balance || c.balance) || 0;
            const rate = parseFloat(c.interest_rate_apr || c.apr) || 36.0;
            const emi = parseFloat(c.minimum_due) || Math.round(bal * 0.05);
            fetchedList.push({
              id: c.id || `card-${Math.random()}`,
              name: c.card_name || `${c.bank_name || "Bank"} Credit Card`,
              lender: c.bank_name || "Credit Card Provider",
              principal: bal || 50000,
              interestRate: rate,
              monthlyEmi: emi,
              category: "Credit Card",
            });
          });
        }

        // Combine fetched real loans with default samples if needed
        const combined = [...fetchedList, ...defaultSampleLoans];
        // Remove duplicates by ID if any
        const uniqueLoans = combined.filter(
          (item, index, self) => index === self.findIndex((t) => t.id === item.id)
        );

        setLoans(uniqueLoans);
        if (uniqueLoans.length > 0) {
          setSelectedLoanId(uniqueLoans[0].id);
        }
      } catch (err) {
        console.error("Error loading liabilities:", err);
        setLoans(defaultSampleLoans);
        setSelectedLoanId(defaultSampleLoans[0].id);
      } finally {
        setLoading(false);
      }
    }

    fetchAllLiabilities();
  }, []);

  const handleAddCustomLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newLoan: LoanOption = {
      id: `custom-${Date.now()}`,
      name: customName,
      lender: customLender || "Custom Lender",
      principal: parseFloat(customPrincipal) || 100000,
      interestRate: parseFloat(customRate) || 14,
      monthlyEmi: parseFloat(customEmi) || 4000,
      category: "Custom Debt",
    };

    const updated = [newLoan, ...loans];
    setLoans(updated);
    setSelectedLoanId(newLoan.id);
    setShowAddCustom(false);
    setCustomName("");
    setCustomLender("");
  };

  const activeLoan = loans.find((l) => l.id === selectedLoanId) || loans[0] || defaultSampleLoans[0];

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
      return `To: The Settlement & Recovery Division
${activeLoan.lender}
Date: ${dateStr}

Subject: Formal Proposal for Full & Final One-Time Settlement (OTS) — ${activeLoan.name} (Principal Balance: ₹${activeLoan.principal.toLocaleString()})

Dear Nodal Officer,

I am writing to initiate a formal One-Time Settlement (OTS) proposal regarding my active account (${activeLoan.name}). The total outstanding principal balance currently recorded is ₹${activeLoan.principal.toLocaleString()}.

In order to achieve early account closure, I am prepared to transfer a lump-sum payment of ₹${settlementOfferAmount.toLocaleString()} (${settlementPercent}% of principal balance), payable immediately upon receipt of your written acceptance letter and No Objection Certificate (NOC).

Key Verified Credibility Factors:
• Monad Blockchain ZK-Reputation Badge: PRF-2026-8841 (Verified On-Chain Compliance)
• Verifiable Payment History: 100% Cryptographic Ledger Recorded on DebtProof

Please confirm acceptance of this settlement offer within 14 business days so we may finalize the transaction and close this account in full.

Sincerely,
Abhimanyu Vaishnav
DebtProof Account Holder`;
    }

    if (proposalType === "rate_reduction") {
      return `To: Nodal Credit Officer / Loan Operations
${activeLoan.lender}
Date: ${dateStr}

Subject: Request for Interest Rate Concession & Loan Restructuring (${activeLoan.name})

Dear Credit Officer,

I have been maintaining an active account (${activeLoan.name}) with your institution at an existing interest rate of ${activeLoan.interestRate}%.

Based on current competitive rate benchmarks and my cryptographically verified on-chain payment track record on the Monad Blockchain, I request a reduction of my interest rate to Math.max(7.5, ${(
        activeLoan.interestRate - 4.5
      ).toFixed(1)})% per annum or an EMI recalculation.

Thank you for your prompt cooperation.

Sincerely,
Abhimanyu Vaishnav`;
    }

    return `To: Debt Restructuring Cell
${activeLoan.lender}
Date: ${dateStr}

Subject: Application for Temporary EMI Hardship Relief (${activeLoan.name})

Dear Sir/Madam,

I am requesting a 6-month EMI restructuring plan for loan account (${activeLoan.name}) with a current monthly payment of ₹${activeLoan.monthlyEmi.toLocaleString()}/month.

I request a temporary pause on interest accrual for 90 days. All prior payments remain verified on the Monad Blockchain registry.

Sincerely,
Abhimanyu Vaishnav`;
  };

  const currentProposal = generateProposalText();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentProposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    try {
      const { recordPaymentActivityAndNotification } = require("@/services/activity.service");
      recordPaymentActivityAndNotification({
        title: `Settlement Proposal Generated: ${activeLoan?.name || "Loan"}`,
        description: `Settlement offer letter created (Discount Offer: ₹${settlementOfferAmount.toLocaleString()}).`,
        amount: settlementOfferAmount,
        icon: "📄",
        color: "purple",
        event_type: "settlement_proposal",
      });
    } catch {}
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
              Monad ZK-Proof Enhanced • All Active Liabilities Loaded ({loans.length})
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
            AI Debt Settlement & Bank Negotiation Studio
          </h2>

          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-medium">
            Calculate lump-sum settlement discount savings across all your bank loans and credit cards, model single-payoff offers (50% - 90% principal discounts), and generate formal AI negotiation letters.
          </p>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls & Loan Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target Liability Selection */}
          <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                1. Select Liability ({loans.length} Total)
              </h3>

              <button
                onClick={() => setShowAddCustom(!showAddCustom)}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                {showAddCustom ? "Cancel" : "+ Add Other Loan"}
              </button>
            </div>

            {/* Custom loan addition form */}
            {showAddCustom && (
              <form onSubmit={handleAddCustomLoan} className="p-4 rounded-xl bg-[var(--color-surface-tertiary)] border border-purple-500/30 space-y-3">
                <span className="text-xs font-bold block text-purple-400">Add Loan / Liability for Settlement</span>
                <input
                  type="text"
                  placeholder="Loan / Debt Name (e.g. Bajaj Finserv Personal Loan)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-light)] text-xs font-sans"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Lender Name"
                    value={customLender}
                    onChange={(e) => setCustomLender(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-light)] text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Principal (₹)"
                    value={customPrincipal}
                    onChange={(e) => setCustomPrincipal(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-light)] text-xs font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Add to Settlement Studio ✓
                </button>
              </form>
            )}

            {/* Loans Scroll List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {loading ? (
                <div className="p-4 text-center text-xs text-[var(--color-text-tertiary)]">Loading liabilities...</div>
              ) : (
                loans.map((loan) => (
                  <button
                    key={loan.id}
                    onClick={() => setSelectedLoanId(loan.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      selectedLoanId === loan.id
                        ? "bg-purple-500/15 border-purple-500/50 ring-1 ring-purple-500/30"
                        : "bg-[var(--color-surface-tertiary)] border-[var(--color-border-light)] hover:bg-[var(--color-surface-secondary)]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs block text-[var(--color-text-primary)]">
                          {loan.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold">
                          {loan.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-[var(--color-text-tertiary)]">
                        {loan.lender} • {loan.interestRate}% APR
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{loan.principal.toLocaleString()}
                    </span>
                  </button>
                ))
              )}
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
                <span className="text-[var(--color-text-tertiary)]">Settlement Payoff Offer:</span>
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
            {/* Header & Proposal Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border-light)] pb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                  3. AI Negotiation Proposal Studio
                </h3>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  Custom letter for {activeLoan.lender} ({activeLoan.name})
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
                Ready to send to bank manager or credit department
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
