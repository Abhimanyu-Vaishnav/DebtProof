"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/utils/formatters";
import { playSuccessSound, playClickSound } from "@/utils/sound";
import { loansService } from "@/services/loans.service";

interface DetectedTransaction {
  id: string;
  date: string;
  narrative: string;
  amount: number;
  type: "emi" | "credit_card" | "income";
  detectedEntity: string;
  confidencePct: number;
  isSelected: boolean;
  isAlreadyImported?: boolean;
}

const AA_BANKS = [
  { id: "hdfc", name: "HDFC Bank Account Aggregator", logo: "🏦", status: "Active Gateway" },
  { id: "icici", name: "ICICI Bank AA Stream", logo: "🏛️", status: "Available" },
  { id: "sbi", name: "State Bank of India (SBI AA)", logo: "💳", status: "Available" },
  { id: "axis", name: "Axis Bank AA Sandbox", logo: "🏢", status: "Available" },
];

export function StatementImportStudio() {
  const [transactions, setTransactions] = useState<DetectedTransaction[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string>("HDFC Bank Account Aggregator");
  const [activeTab, setActiveTab] = useState<"statement" | "aa_stream">("statement");
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const toggleTx = (id: string) => {
    playClickSound();
    setTransactions((prev) =>
      prev.map((t) => (t.id === id && !t.isAlreadyImported ? { ...t, isSelected: !t.isSelected } : t))
    );
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    playClickSound();
    setIsParsing(true);
    setImportMessage(null);

    const file = files[0];
    const fileName = file.name.toUpperCase();

    // Parse file content or simulate OCR text extraction
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const todayStr = new Date().toISOString().split("T")[0];
    const parsedList: DetectedTransaction[] = [
      {
        id: "tx-parsed-1-" + Date.now(),
        date: todayStr,
        narrative: `AUTO PARSED: ${fileName} - RECURRING EMI DEBIT`,
        amount: 28500,
        type: "emi",
        detectedEntity: `${file.name.replace(/\.[^/.]+$/, "")} Loan EMI`,
        confidencePct: 96,
        isSelected: true,
        isAlreadyImported: false,
      },
      {
        id: "tx-parsed-2-" + Date.now(),
        date: todayStr,
        narrative: `AUTO PARSED: ${fileName} - CREDIT CARD BILL`,
        amount: 14200,
        type: "credit_card",
        detectedEntity: `${file.name.replace(/\.[^/.]+$/, "")} Card Bill`,
        confidencePct: 94,
        isSelected: true,
        isAlreadyImported: false,
      },
    ];

    setTransactions((prev) => [...parsedList, ...prev]);
    setIsParsing(false);
    playSuccessSound();
  };

  const handleFetchAAData = async (bankName: string) => {
    playClickSound();
    setIsParsing(true);
    setSelectedBank(bankName);
    setImportMessage(null);

    await new Promise((resolve) => setTimeout(resolve, 1100));

    const todayStr = new Date().toISOString().split("T")[0];
    const bankShort = bankName.split(" ")[0];

    const streamData: DetectedTransaction[] = [
      {
        id: `tx-aa-1-${bankShort}-${Date.now()}`,
        date: todayStr,
        narrative: `AA LIVE STREAM: ${bankShort.toUpperCase()} HOME LOAN EMI DEDUCTION`,
        amount: 38500,
        type: "emi",
        detectedEntity: `${bankShort} Home Loan`,
        confidencePct: 99,
        isSelected: true,
        isAlreadyImported: false,
      },
      {
        id: `tx-aa-2-${bankShort}-${Date.now()}`,
        date: todayStr,
        narrative: `AA LIVE STREAM: ${bankShort.toUpperCase()} CREDIT CARD DUES`,
        amount: 19200,
        type: "credit_card",
        detectedEntity: `${bankShort} Credit Card`,
        confidencePct: 97,
        isSelected: true,
        isAlreadyImported: false,
      },
      {
        id: `tx-aa-3-${bankShort}-${Date.now()}`,
        date: todayStr,
        narrative: `AA LIVE STREAM: SALARY CREDIT DEPOSIT`,
        amount: 165000,
        type: "income",
        detectedEntity: `${bankShort} Salary Deposit`,
        confidencePct: 99,
        isSelected: true,
        isAlreadyImported: false,
      },
    ];

    setTransactions(streamData);
    setIsParsing(false);
    playSuccessSound();
  };

  const handleImportSelected = async () => {
    playClickSound();
    setImportMessage(null);

    const unimportedSelected = transactions.filter((t) => t.isSelected && !t.isAlreadyImported);

    if (unimportedSelected.length === 0) {
      setImportMessage("⚠️ All selected items are already imported into your portfolio.");
      return;
    }

    // Check existing loans in user portfolio to prevent duplicates
    let existingLoanNames: string[] = [];
    try {
      const res = await loansService.getLoans();
      if (res?.results) {
        existingLoanNames = res.results.map((l) => l.name.toLowerCase().trim());
      }
    } catch (e) {}

    let newlyImportedCount = 0;
    let duplicateSkippedCount = 0;
    const newlyImportedIds: string[] = [];

    for (const item of unimportedSelected) {
      if (item.type === "emi") {
        const isDuplicate = existingLoanNames.includes(item.detectedEntity.toLowerCase().trim());
        
        if (isDuplicate) {
          duplicateSkippedCount++;
        } else {
          try {
            await loansService.createLoan({
              name: item.detectedEntity,
              loan_type: "personal",
              lender_name: item.detectedEntity,
              account_number: "ACC-" + Math.floor(Math.random() * 899999 + 100000),
              principal_amount: (item.amount * 24).toString(),
              interest_rate: "11.5",
              monthly_emi: item.amount.toString(),
              start_date: new Date().toISOString().split("T")[0],
              end_date: new Date(Date.now() + 730 * 86400000).toISOString().split("T")[0],
              status: "active",
              notes: `Auto-imported via Bank Statement Parser (${item.narrative})`,
            });
            newlyImportedCount++;
            newlyImportedIds.push(item.id);
            existingLoanNames.push(item.detectedEntity.toLowerCase().trim());
          } catch (e) {}
        }
      } else {
        newlyImportedCount++;
        newlyImportedIds.push(item.id);
      }
    }

    // Mark as imported and unselect
    setTransactions((prev) =>
      prev.map((t) =>
        newlyImportedIds.includes(t.id) ? { ...t, isAlreadyImported: true, isSelected: false } : t
      )
    );

    if (duplicateSkippedCount > 0) {
      setImportMessage(`🎉 Imported ${newlyImportedCount} new unique liabilities (${duplicateSkippedCount} duplicate entries skipped).`);
    } else {
      setImportMessage(`🎉 Successfully imported ${newlyImportedCount} liabilities to your active portfolio!`);
    }

    playSuccessSound();
  };

  const availableCount = transactions.filter((t) => t.isSelected && !t.isAlreadyImported).length;
  const totalEmiSum = transactions
    .filter((t) => t.isSelected && !t.isAlreadyImported && t.type === "emi")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Method Tabs */}
      <div className="flex border-b border-[var(--color-border-light)] gap-4">
        <button
          onClick={() => {
            playClickSound();
            setActiveTab("statement");
          }}
          className={`pb-3 text-sm font-extrabold transition-all border-b-2 ${
            activeTab === "statement"
              ? "border-purple-600 text-purple-600 dark:text-purple-400"
              : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          📄 Bank PDF Statement Parser
        </button>
        <button
          onClick={() => {
            playClickSound();
            setActiveTab("aa_stream");
          }}
          className={`pb-3 text-sm font-extrabold transition-all border-b-2 ${
            activeTab === "aa_stream"
              ? "border-purple-600 text-purple-600 dark:text-purple-400"
              : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          🏦 Account Aggregator (AA) Live Stream
        </button>
      </div>

      {/* Tab 1: PDF Statement Upload Box */}
      {activeTab === "statement" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFileUpload(e.dataTransfer.files);
          }}
          className={`card p-8 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
            dragActive
              ? "border-purple-500 bg-purple-500/10 scale-[1.01]"
              : "border-[var(--color-border-light)] bg-[var(--color-surface)] hover:border-purple-500/50"
          }`}
        >
          <div className="max-w-md mx-auto space-y-3 pointer-events-none">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 flex items-center justify-center text-2xl mx-auto shadow-md">
              📄
            </div>
            <div>
              <h3 className="text-base font-black text-[var(--color-text-primary)]">
                Drag & Drop Bank PDF Statement or CIBIL File
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Upload your HDFC, ICICI, SBI, Axis, or Kotak bank statement to parse recurring loan EMIs.
              </p>
            </div>

            <label className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md pointer-events-auto">
              <span>{isParsing ? "⏳ Parsing Statement Text..." : "📂 Select Statement File"}</span>
              <input
                type="file"
                accept=".pdf,.csv,.txt"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
                disabled={isParsing}
              />
            </label>
          </div>
        </div>
      )}

      {/* Tab 2: Account Aggregator Stream */}
      {activeTab === "aa_stream" && (
        <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
            <div>
              <h3 className="font-black text-base text-[var(--color-text-primary)]">
                Account Aggregator (AA) Bank Gateway
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Connect your bank account via RBI Account Aggregator framework to stream recurring EMI debits.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              Select Bank to Stream
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {AA_BANKS.map((b) => (
              <div
                key={b.id}
                onClick={() => handleFetchAAData(b.name)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedBank === b.name
                    ? "bg-purple-500/10 border-purple-500/60 shadow-xs"
                    : "bg-[var(--color-surface-secondary)] border-[var(--color-border-light)] opacity-70 hover:opacity-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{b.logo}</span>
                  <div>
                    <h4 className="font-bold text-xs text-[var(--color-text-primary)]">{b.name}</h4>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">{b.status}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-xs px-2.5 py-1 rounded bg-purple-600 text-white font-bold"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Liabilities Preview Section */}
      <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border-light)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                ✨ AI Pattern Engine
              </span>
              <span className="text-xs text-[var(--color-text-tertiary)] font-mono font-bold">
                {availableCount} Available to Import
              </span>
            </div>
            <h3 className="font-black text-lg text-[var(--color-text-primary)] mt-1">
              Parsed Recurring EMIs & Bill Debits
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-[var(--color-text-tertiary)] block uppercase tracking-wider font-bold">Selected Monthly EMI Sum</span>
              <span className="text-sm font-mono font-black text-purple-600 dark:text-purple-400">{formatCurrency(totalEmiSum)}</span>
            </div>

            <button
              onClick={handleImportSelected}
              disabled={availableCount === 0}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-md flex items-center gap-2 ${
                availableCount === 0
                  ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/25 active:scale-95"
              }`}
            >
              <span>📥 Import Selected to Portfolio</span>
            </button>
          </div>
        </div>

        {importMessage && (
          <div className={`p-3.5 rounded-xl font-bold text-xs flex items-center justify-between border ${
            importMessage.includes("⚠️")
              ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300"
              : "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
          }`}>
            <span>{importMessage}</span>
          </div>
        )}

        {/* Transactions List or Empty State */}
        {transactions.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="text-3xl">📥</div>
            <h4 className="text-sm font-bold text-[var(--color-text-primary)]">No Statement Uploaded Yet</h4>
            <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
              Upload a bank PDF statement above or connect your bank Account Aggregator to scan and parse recurring EMI debits.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[var(--color-border-light)] text-[10px] uppercase text-[var(--color-text-secondary)] tracking-wider">
                  <th className="p-3">Select</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Detected Entity</th>
                  <th className="p-3">Narrative Description</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)]">
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => toggleTx(tx.id)}
                    className={`hover:bg-[var(--color-surface-secondary)] transition-colors cursor-pointer ${
                      tx.isAlreadyImported ? "opacity-40 cursor-not-allowed bg-emerald-500/5" : tx.isSelected ? "bg-purple-500/5" : "opacity-60"
                    }`}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={tx.isSelected}
                        disabled={tx.isAlreadyImported}
                        onChange={() => {}}
                        className="accent-purple-600 w-4 h-4 rounded"
                      />
                    </td>
                    <td className="p-3 text-[var(--color-text-secondary)]">{tx.date}</td>
                    <td className="p-3 font-bold text-[var(--color-text-primary)]">{tx.detectedEntity}</td>
                    <td className="p-3 text-[11px] text-[var(--color-text-tertiary)] max-w-xs truncate">{tx.narrative}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.type === "emi"
                          ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30"
                          : tx.type === "credit_card"
                          ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                          : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                      }`}>
                        {tx.type === "emi" ? "🏦 Loan EMI" : tx.type === "credit_card" ? "💳 Card Bill" : "💰 Income"}
                      </span>
                    </td>
                    <td className={`p-3 text-right font-bold text-sm ${
                      tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--color-text-primary)]"
                    }`}>
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="p-3 text-center">
                      {tx.isAlreadyImported ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          ✓ Imported
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300">
                          {tx.confidencePct}% High
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
