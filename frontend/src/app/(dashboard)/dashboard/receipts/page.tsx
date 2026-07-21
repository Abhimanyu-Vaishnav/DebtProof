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
import type { Payment } from "@/types";

export default function ReceiptsPage() {
  const [receiptPayments, setReceiptPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProofPayment, setSelectedProofPayment] = useState<Payment | null>(null);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const res = await paymentsService.getAllPayments({ page_size: 100 });
        const withReceipts = (res.results ?? []).filter(p => p.has_receipt && p.receipt);
        setReceiptPayments(withReceipts);
      } catch (err) {
        console.error("Failed to load receipts", err);
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
                          href={`https://testnet.monadsv.com/tx/${rec.blockchain_tx_hash}`}
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
        />
      )}
    </>
  );
}
