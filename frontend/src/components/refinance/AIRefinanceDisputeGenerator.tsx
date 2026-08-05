'use client';

import React, { useState } from 'react';

export default function AIRefinanceDisputeGenerator() {
  const [docType, setDocType] = useState<'refinance' | 'dispute'>('refinance');
  const [lenderName, setLenderName] = useState('HDFC Bank Ltd');
  const [loanAcc, setLoanAcc] = useState('LN-90182-HDFC');
  const [currentRate, setCurrentRate] = useState('11.5');
  const [targetRate, setTargetRate] = useState('8.4');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedLetter('');

    setTimeout(() => {
      if (docType === 'refinance') {
        setGeneratedLetter(`Date: ${new Date().toLocaleDateString()}
To,
The Manager / Nodal Officer
${lenderName}

Subject: Request for Interest Rate Reduction / Balance Transfer NOC for Loan Acc: ${loanAcc}

Respected Sir/Madam,

I am writing to bring to your attention that I have been maintaining an exemplary repayment record for my home loan (Acc: ${loanAcc}). My current interest rate charged is ${currentRate}% p.a., whereas competing banking institutions are offering balance transfer rates starting at ${targetRate}% p.a.

Given my 780+ CIBIL score and zero default history, I kindly request you to reduce my applicable ROI to ${targetRate}% p.a. Or issue a No Objection Certificate (NOC) and foreclosure statement for balance transfer.

Sincerely,
Verified DebtProof Borrower`);
      } else {
        setGeneratedLetter(`Date: ${new Date().toLocaleDateString()}
To,
CIBIL / Experian Credit Grievance Redressal Cell

Subject: Formal Dispute Petition regarding Incorrect Late Payment Entry for Loan Acc: ${loanAcc}

Respected Officer,

I hereby raise a formal dispute regarding a erroneous delayed repayment entry reported under my CIBIL profile for loan account ${loanAcc} with ${lenderName}.

All monthly EMIs for this loan were paid on time, as backed by SHA-256 cryptographic document hashes anchored on the Monad Testnet Blockchain. I request immediate rectification of this record within 30 days under CICRA regulations.

Enclosed: Monad On-Chain Proof Verification Receipt & Bank Payment Logs.

Sincerely,
Verified DebtProof Borrower`);
      }
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-light)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h2 className="text-lg font-black text-[var(--color-text-primary)]">
              AI Refinance Letter & Credit Dispute Generator
            </h2>
          </div>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
            Generate formal legal letters to negotiate interest rate drops with banks or petition CIBIL bureau disputes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[var(--color-surface-secondary)] p-4 rounded-2xl border border-[var(--color-border-light)] text-xs">
        <div>
          <label className="block font-bold text-[var(--color-text-tertiary)] uppercase mb-1">Document Type</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as any)}
            className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] font-bold"
          >
            <option value="refinance">Rate Reduction Request Letter</option>
            <option value="dispute">CIBIL Bureau Dispute Petition</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-[var(--color-text-tertiary)] uppercase mb-1">Bank / Lender Name</label>
          <input
            type="text"
            value={lenderName}
            onChange={(e) => setLenderName(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
          />
        </div>

        <div>
          <label className="block font-bold text-[var(--color-text-tertiary)] uppercase mb-1">Loan Account Number</label>
          <input
            type="text"
            value={loanAcc}
            onChange={(e) => setLoanAcc(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] font-mono"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            {isGenerating ? 'Generating Letter...' : 'Draft AI Letter'}
          </button>
        </div>
      </div>

      {generatedLetter && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Generated Document Preview</span>
            <button
              onClick={() => navigator.clipboard.writeText(generatedLetter)}
              className="text-xs text-[var(--color-primary-light)] hover:underline font-bold"
            >
              📋 Copy to Clipboard
            </button>
          </div>
          <pre className="p-4 rounded-2xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border-light)] text-xs font-mono whitespace-pre-wrap leading-relaxed text-[var(--color-text-primary)]">
            {generatedLetter}
          </pre>
        </div>
      )}
    </div>
  );
}
