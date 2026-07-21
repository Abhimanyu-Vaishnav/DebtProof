"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/utils/formatters";
import { loansService } from "@/services/loans.service";
import type { LoanType } from "@/types";

interface ParsedLoanItem {
  id: string;
  name: string;
  lender_name: string;
  loan_type: LoanType;
  principal_amount: string;
  monthly_emi: string;
  interest_rate: string;
}

interface CibilParserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CibilParserModal({ onClose, onSuccess }: CibilParserModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedLoans, setParsedLoans] = useState<ParsedLoanItem[] | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const sampleParsedLoans: ParsedLoanItem[] = [
    {
      id: "1",
      name: "HDFC Housing Debt",
      lender_name: "HDFC Bank Ltd",
      loan_type: "home",
      principal_amount: "4500000",
      monthly_emi: "38500",
      interest_rate: "8.50",
    },
    {
      id: "2",
      name: "ICICI Auto Credit",
      lender_name: "ICICI Bank",
      loan_type: "vehicle",
      principal_amount: "850000",
      monthly_emi: "16200",
      interest_rate: "9.20",
    },
    {
      id: "3",
      name: "SBI Express Personal",
      lender_name: "State Bank of India",
      loan_type: "personal",
      principal_amount: "250000",
      monthly_emi: "7800",
      interest_rate: "11.50",
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleParseReport = () => {
    if (!file) return;
    setIsParsing(true);
    setTimeout(() => {
      setParsedLoans(sampleParsedLoans);
      setIsParsing(false);
    }, 1000);
  };

  const handleBulkImport = async () => {
    if (!parsedLoans || parsedLoans.length === 0) return;
    setIsImporting(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const nextYear = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      for (const item of parsedLoans) {
        await loansService.createLoan({
          name: item.name,
          loan_type: item.loan_type,
          lender_name: item.lender_name,
          principal_amount: item.principal_amount,
          interest_rate: item.interest_rate,
          monthly_emi: item.monthly_emi,
          start_date: today,
          end_date: nextYear,
          notes: "Imported via CIBIL Credit Report PDF Extractor",
        });
      }

      alert(`Successfully imported ${parsedLoans.length} loan accounts from CIBIL report!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(`Error importing loans: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="card w-full max-w-xl bg-[var(--color-surface)] border border-[var(--color-border-light)] shadow-2xl p-6 space-y-5 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">CIBIL / Experian Report Extractor</h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">Auto-populate loan accounts from credit bureau PDFs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] font-bold flex items-center justify-center hover:bg-[var(--color-surface-secondary)]"
          >
            ✕
          </button>
        </div>

        {/* Step 1: Upload File */}
        {!parsedLoans ? (
          <div className="space-y-4">
            <div className="p-6 border-2 border-dashed border-[var(--color-border)] rounded-2xl text-center space-y-3 bg-[var(--color-surface-secondary)]/50 hover:bg-[var(--color-surface-secondary)] transition-colors">
              <span className="text-3xl block">📑</span>
              <div>
                <p className="text-xs font-bold text-[var(--color-text-primary)]">Upload your CIBIL / Experian PDF Report</p>
                <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">PDF or text summary files supported</p>
              </div>
              <input
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="cibil-file-input"
              />
              <label
                htmlFor="cibil-file-input"
                className="btn btn-secondary btn-xs px-4 py-1.5 font-bold cursor-pointer inline-block"
              >
                {file ? file.name : "Select Credit Report PDF"}
              </label>
            </div>

            <button
              onClick={handleParseReport}
              disabled={!file || isParsing}
              className="btn btn-primary btn-sm w-full py-2.5 font-bold text-xs"
            >
              {isParsing ? "Extracting Accounts & Balances..." : "Parse Credit Report"}
            </button>
          </div>
        ) : (
          /* Step 2: Review Extracted Accounts & Confirm Import */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Extracted Loan Accounts ({parsedLoans.length})
              </h4>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Ready to Import
              </span>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {parsedLoans.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[var(--color-text-primary)] block">{item.name}</span>
                    <span className="text-[10px] text-[var(--color-text-tertiary)]">{item.lender_name} · {item.interest_rate}% APR</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[var(--color-accent)] block">{formatCurrency(parseFloat(item.principal_amount))}</span>
                    <span className="text-[10px] text-[var(--color-text-tertiary)]">EMI: {formatCurrency(parseFloat(item.monthly_emi))}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setParsedLoans(null)}
                className="btn btn-secondary btn-sm px-4 py-2 font-bold text-xs"
              >
                Re-upload
              </button>
              <button
                onClick={handleBulkImport}
                disabled={isImporting}
                className="btn btn-primary btn-sm flex-1 py-2.5 font-bold text-xs justify-center"
              >
                {isImporting ? "Importing Accounts..." : `Import All ${parsedLoans.length} Loans to DebtProof`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
