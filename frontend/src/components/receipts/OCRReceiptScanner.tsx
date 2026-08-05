'use client';

import React, { useState } from 'react';

export default function OCRReceiptScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [parsedData, setParsedData] = useState<{
    lender: string;
    amount: string;
    date: string;
    txnId: string;
    confidence: number;
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setParsedData(null);

    // Simulate OCR text parsing from receipt image/PDF
    setTimeout(() => {
      setParsedData({
        lender: 'HDFC Bank Ltd (Home Loan EMI)',
        amount: '₹24,500.00',
        date: '2026-08-01',
        txnId: 'TXN-HDFC-991823-PROOF',
        confidence: 98.4
      });
      setIsScanning(false);
    }, 1800);
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-light)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📷</span>
            <h2 className="text-lg font-black text-[var(--color-text-primary)]">
              AI OCR Receipt Auto-Parser
            </h2>
          </div>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
            Drag & drop bank receipts or UPI payment screenshots to auto-extract transaction details
          </p>
        </div>
      </div>

      <div className="border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] rounded-2xl p-8 text-center transition bg-[var(--color-surface-secondary)] cursor-pointer relative">
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="space-y-2">
          <div className="text-3xl">📥</div>
          <p className="text-xs font-bold text-[var(--color-text-primary)]">
            Click or drag payment receipt image / PDF here
          </p>
          <p className="text-[10px] text-[var(--color-text-tertiary)]">
            Supports HDFC, SBI, ICICI, Axis, GooglePay, PhonePe, Paytm receipts
          </p>
        </div>
      </div>

      {isScanning && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-center space-y-2">
          <div className="inline-block animate-spin text-xl">🔄</div>
          <p className="text-xs font-bold text-indigo-400">Scanning receipt image with Vision OCR...</p>
        </div>
      )}

      {parsedData && (
        <div className="p-5 bg-[var(--color-surface-tertiary)] rounded-2xl border border-[var(--color-border-light)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Extracted Receipt Metadata</span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
              {parsedData.confidence}% OCR Accuracy
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase block">Detected Lender</span>
              <span className="font-bold text-[var(--color-text-primary)]">{parsedData.lender}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase block">Extracted Amount</span>
              <span className="font-bold text-emerald-500">{parsedData.amount}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase block">Payment Date</span>
              <span className="font-bold text-[var(--color-text-primary)]">{parsedData.date}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase block">Txn Reference</span>
              <span className="font-mono text-[var(--color-primary-light)] font-bold">{parsedData.txnId}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => alert(`Receipt metadata auto-filled into Payment Logger!`)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              ✓ Auto-Log Payment & Hash to Monad Blockchain
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
