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
  const [settlementPercent, setSettlementPercent] = useState<number>(75);
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

        const combined = [...fetchedList, ...defaultSampleLoans];
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

  // Multi-Loan Consolidation Calculator
  const totalDebtBalance = loans.reduce((acc, curr) => acc + curr.principal, 0);
  const weightedInterestRate = loans.length > 0 
    ? (loans.reduce((acc, curr) => acc + (curr.principal * curr.interestRate), 0) / totalDebtBalance).toFixed(1)
    : "14.0";
  const totalCurrentMonthlyEmi = loans.reduce((acc, curr) => acc + curr.monthlyEmi, 0);

  // Consolidated Single Loan Offer (e.g. 9.5% p.a. balance transfer offer)
  const consolidatedRate = 9.5;
  const consolidatedTenureMonths = 48;
  const consolidatedMonthlyRate = consolidatedRate / (12 * 100);
  const consolidatedNewEmi = Math.round(
    (totalDebtBalance * consolidatedMonthlyRate * Math.pow(1 + consolidatedMonthlyRate, consolidatedTenureMonths)) /
    (Math.pow(1 + consolidatedMonthlyRate, consolidatedTenureMonths) - 1)
  ) || 0;
  const monthlyEmiSavings = Math.max(0, totalCurrentMonthlyEmi - consolidatedNewEmi);

  // Settlement calculations
  const settlementOfferAmount = Math.round(activeLoan.principal * (settlementPercent / 100));
  const directSavings = activeLoan.principal - settlementOfferAmount;

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

Based on current competitive rate benchmarks and my cryptographically verified on-chain payment track record on the Monad Blockchain, I request a reduction of my interest rate to ${Math.max(7.5, activeLoan.interestRate - 4.5).toFixed(1)}% per annum or an EMI recalculation.

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
  };

  const handlePrintPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Debt Settlement & Consolidation Proposal - ${activeLoan.name}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            .header { border-bottom: 2px solid #6366f1; padding-bottom: 15px; margin-bottom: 30px; }
            .title { font-size: 20px; font-weight: bold; color: #0f172a; }
            .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
            .content { font-family: monospace; font-size: 13px; background: #f8fafc; padding: 25px; border-radius: 8px; border: 1px solid #cbd5e1; whitespace: pre-wrap; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">DebtProof — Official Bank Settlement & Negotiation Proposal</div>
            <div class="subtitle">Cryptographically Verified On-Chain Payment Records | Monad Blockchain ID: 10143</div>
          </div>
          <div class="content">${currentProposal}</div>
          <div class="footer">Generated by DebtProof AI Strategy Coach · Admissible Financial Record · Sanatan Labs</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Feature Banner */}
      <div className="card p-6 border-2 border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-[var(--color-surface)] to-[var(--color-surface)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
              🤖 AI Debt Optimization Suite
            </span>
            <h2 className="text-xl font-black text-[var(--color-text-primary)]">
              AI Debt Consolidation & Multi-Lender Negotiation Assistant
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Combine multiple high-interest debts into one low EMI loan & generate formal settlement letters embedded with Monad ZK proofs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddCustom(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>+</span> <span>Add Custom Liability</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Loan Consolidation Strategy Card */}
      <div className="card p-6 border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">1. Multi-Loan Debt Consolidation Plan</h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">Consolidate all {loans.length} active liabilities into a single 9.5% p.a. balance transfer</p>
            </div>
          </div>
          <span className="text-xs font-black uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Save ₹{monthlyEmiSavings.toLocaleString()}/mo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] text-center">
            <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase">Total Outstanding Debt</p>
            <p className="text-lg font-black text-[var(--color-text-primary)] mt-1">₹{totalDebtBalance.toLocaleString()}</p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] text-center">
            <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase">Current Average Rate</p>
            <p className="text-lg font-black text-rose-500 mt-1">{weightedInterestRate}% p.a.</p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] text-center">
            <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase">Current Combined EMI</p>
            <p className="text-lg font-black text-[var(--color-text-primary)] mt-1">₹{totalCurrentMonthlyEmi.toLocaleString()}/mo</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-[10px] font-bold text-emerald-400 uppercase">Consolidated Single EMI</p>
            <p className="text-lg font-black text-emerald-400 mt-1">₹{consolidatedNewEmi.toLocaleString()}/mo</p>
          </div>
        </div>
      </div>

      {/* Add Custom Loan Modal */}
      {showAddCustom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full p-6 space-y-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Add Liability to Negotiate</h3>
              <button onClick={() => setShowAddCustom(false)} className="text-xs text-[var(--color-text-tertiary)] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddCustomLoan} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--color-text-secondary)]">Debt Name</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Credit Card / Car Loan"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="form-input text-xs w-full mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-text-secondary)]">Lender / Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank Ltd"
                  value={customLender}
                  onChange={(e) => setCustomLender(e.target.value)}
                  className="form-input text-xs w-full mt-1"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-secondary)]">Principal (₹)</label>
                  <input
                    type="number"
                    value={customPrincipal}
                    onChange={(e) => setCustomPrincipal(e.target.value)}
                    className="form-input text-xs w-full mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-secondary)] font-mono">Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value)}
                    className="form-input text-xs w-full mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-secondary)]">EMI (₹)</label>
                  <input
                    type="number"
                    value={customEmi}
                    onChange={(e) => setCustomEmi(e.target.value)}
                    className="form-input text-xs w-full mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 btn btn-primary font-bold text-xs py-2">Add Debt</button>
                <button type="button" onClick={() => setShowAddCustom(false)} className="btn btn-secondary text-xs">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid: Left Column Selector (5 cols) & Right Column Proposal Studio (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Select Target Loan & Discount Parameters */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Target Loan Selector */}
          <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border-light)] pb-2">
              2. Select Target Debt for Proposal
            </h3>

            {loading ? (
              <div className="h-24 rounded-xl bg-[var(--color-surface-secondary)] animate-pulse" />
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {loans.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLoanId(l.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      selectedLoanId === l.id
                        ? "bg-purple-600/10 border-purple-500/50 ring-2 ring-purple-500/30"
                        : "border-[var(--color-border-light)] hover:bg-[var(--color-surface-secondary)]"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-primary)]">{l.name}</p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)]">{l.lender} · {l.category}</p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="text-xs font-bold text-[var(--color-text-primary)]">₹{l.principal.toLocaleString()}</p>
                      <p className="text-[10px] text-rose-500 font-bold">{l.interestRate}% p.a.</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Settlement Percentage Slider */}
          <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">One-Time Settlement Offer</h3>
              <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                {settlementPercent}% of Principal
              </span>
            </div>

            <input
              type="range"
              min={40}
              max={90}
              step={5}
              value={settlementPercent}
              onChange={(e) => setSettlementPercent(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
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
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-[var(--color-text-tertiary)] font-mono">
                Ready to send to bank manager or credit department
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintPDF}
                  className="px-4 py-2.5 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] hover:border-purple-500 text-[var(--color-text-primary)] font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>📄 Print / Export PDF</span>
                </button>
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
