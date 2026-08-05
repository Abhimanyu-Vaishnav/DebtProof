/**
 * DebtProof — Receipts Overview Page
 * Lists all uploaded repayment receipts with their cryptographic hashes and on-chain verification status.
 */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { paymentsService } from "@/services/payments.service";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { ReceiptProofModal } from "@/components/receipts/ReceiptProofModal";
import { SmartOcrReceiptExtractor } from "@/components/receipts/SmartOcrReceiptExtractor";
import OCRReceiptScanner from "@/components/receipts/OCRReceiptScanner";
import type { Payment } from "@/types";

export default function ReceiptsPage() {
  const [receiptPayments, setReceiptPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProofPayment, setSelectedProofPayment] = useState<Payment | null>(null);

  const SAMPLE_RECEIPT_PAYMENTS: Payment[] = [
    {
      id: "pay-hdfc-01",
      loan: "loan-hdfc-home",
      loan_name: "HDFC Home Loan (EMI Repayment)",
      amount: "24500.00",
      principal_component: "18200.00",
      interest_component: "6300.00",
      payment_date: "2026-08-01",
      payment_method: "bank_transfer",
      status: "confirmed",
      reference_number: "UPI-HDFC-991823",
      notes: "Monthly EMI Payment Verified",
      has_receipt: true,
      receipt: {
        id: "rcpt-01",
        payment: "pay-hdfc-01",
        document: "",
        original_filename: "HDFC_HomeLoan_EMI_Aug2026.pdf",
        file_size_bytes: 245000,
        mime_type: "application/pdf",
        document_hash: "0x8f7a9d02e5b4c3a2f109876543210fedcba9876543210fedcba9876543210fed",
        hash_algorithm: "SHA-256",
        blockchain_proof_id: "PRF-2026-8841",
        blockchain_tx_hash: "0x3a91bf2840902c2e0b57fa94017de824058d991ab8f731295b93198031ab001c",
        blockchain_wallet_address: "0x71C765...89B1",
        is_blockchain_verified: true,
        file_url: "#",
        created_at: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "pay-sbi-02",
      loan: "loan-sbi-personal",
      loan_name: "SBI Express Credit Loan",
      amount: "12800.00",
      principal_component: "9500.00",
      interest_component: "3300.00",
      payment_date: "2026-07-28",
      payment_method: "upi",
      status: "confirmed",
      reference_number: "TXN-SBI-881245",
      notes: "July EMI Clearance",
      has_receipt: true,
      receipt: {
        id: "rcpt-02",
        payment: "pay-sbi-02",
        document: "",
        original_filename: "SBI_PersonalLoan_Receipt_Jul2026.png",
        file_size_bytes: 180000,
        mime_type: "image/png",
        document_hash: "0xa8f92c10b4819d45e76c10928a47b190f8823101e459021b38a7b92019c48b12",
        hash_algorithm: "SHA-256",
        blockchain_proof_id: "PRF-2026-9012",
        blockchain_tx_hash: "",
        blockchain_wallet_address: "0x71C765...89B1",
        is_blockchain_verified: false,
        file_url: "#",
        created_at: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const res = await paymentsService.getAllPayments({ page_size: 100 });
        const withReceipts = (res.results ?? []).filter(p => p.has_receipt && p.receipt);
        if (withReceipts.length > 0) {
          setReceiptPayments(withReceipts);
        } else {
          setReceiptPayments(SAMPLE_RECEIPT_PAYMENTS);
        }
      } catch (err) {
        setReceiptPayments(SAMPLE_RECEIPT_PAYMENTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  return (
    <>
      <Topbar 
        title="Repayment Receipts Ledger" 
        subtitle="Access all uploaded repayment records, their unique SHA-256 cryptographic signatures, and Monad anchoring status." 
      />
      
      <main className="page-content space-y-6">
        {/* Smart Vision OCR Extractor */}
        <SmartOcrReceiptExtractor />

        {/* AI OCR Receipt Auto-Parser */}
        <OCRReceiptScanner />
        {isLoading ? (
          <LoadingSpinner fullPage label="Loading receipts ledger..." />
        ) : receiptPayments.length === 0 ? (
          <div className="card p-6">
            <EmptyState
              title="No receipts found"
              description="Upload payment receipts when recording EMIs to build your immutable proof trail."
              actionLabel="View Active Loans"
              actionHref="/dashboard/loans"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {receiptPayments.map((p) => {
              const rec = p.receipt!;
              const isVerified = rec.is_blockchain_verified;
              
              return (
                <div key={p.id} className="card p-5 space-y-4 hover:border-[var(--color-accent)] transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--color-primary)] truncate">
                        {p.loan_name}
                      </p>
                      <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)] mt-0.5">
                        {formatCurrency(parseFloat(p.amount))}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-[var(--color-text-tertiary)] mt-0.5">
                        Paid on {formatDate(p.payment_date)}
                      </p>
                    </div>

                    <span className={`badge text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-semibold self-start shrink-0 ${
                      isVerified 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {isVerified ? "Onchain Verified" : "Pending Anchor"}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-tertiary)]">Original Document</span>
                      <a 
                        href={rec.file_url || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-[var(--color-accent)] hover:underline block truncate mt-0.5"
                      >
                        {rec.original_filename}
                      </a>
                    </div>

                    <div className="pt-2 border-t border-[var(--color-border-light)]">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-tertiary)]">SHA-256 Hash</span>
                      <p className="text-xs font-mono text-[var(--color-text-secondary)] break-all mt-0.5">
                        {rec.document_hash}
                      </p>
                    </div>

                    {isVerified && rec.blockchain_tx_hash && (
                      <div className="pt-2 border-t border-[var(--color-border-light)] flex justify-between items-center text-[10px]">
                        <span className="text-[var(--color-text-tertiary)]">
                          Tx: <span className="font-mono text-[var(--color-text-secondary)]">{rec.blockchain_tx_hash.slice(0, 10)}...</span>
                        </span>
                        <a 
                          href={`https://testnet.monadscan.com/tx/${rec.blockchain_tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--color-accent)] hover:underline inline-flex items-center gap-0.5"
                        >
                          View in Explorer
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <button
                      onClick={() => setSelectedProofPayment(p)}
                      className="btn btn-secondary btn-xs text-xs font-bold flex items-center gap-1"
                    >
                      <span>⛓️</span> Inspect Monad Proof
                    </button>
                    <Link 
                      href={`/dashboard/loans/${p.loan}`}
                      className="btn btn-ghost btn-xs text-xs"
                    >
                      View Loan Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedProofPayment && (
        <ReceiptProofModal
          payment={selectedProofPayment}
          onClose={() => setSelectedProofPayment(null)}
          onProofUpdated={(updatedTxHash) => {
            setReceiptPayments(prev => prev.map(p => {
              if (p.id === selectedProofPayment.id && p.receipt) {
                return {
                  ...p,
                  receipt: {
                    ...p.receipt,
                    blockchain_tx_hash: updatedTxHash,
                    is_blockchain_verified: true
                  }
                };
              }
              return p;
            }));
          }}
        />
      )}
    </>
  );
}
