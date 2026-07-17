/**
 * DebtProof — Payment Card Component
 * Enhanced with Day 3 Monad Blockchain proof storage, verification, and explorer details.
 */
"use client";

import React, { useState } from "react";
import { Payment, PAYMENT_METHOD_LABELS } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useWallet } from "@/hooks/useWallet";
import { paymentsService } from "@/services/payments.service";
import { useToast } from "@/components/ui/Toast";

const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", className: "badge badge-success" },
  pending: { label: "Pending", className: "badge badge-warning" },
  failed: { label: "Failed", className: "badge badge-error" },
  refunded: { label: "Refunded", className: "badge badge-neutral" },
};

interface PaymentCardProps {
  payment: Payment;
  showLoan?: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: () => void;
}

export function PaymentCard({ payment, showLoan = false, onDelete, onUpdate }: PaymentCardProps) {
  const { label, className } = STATUS_CONFIG[payment.status] ?? {
    label: payment.status,
    className: "badge badge-neutral",
  };

  const { showToast } = useToast();
  const wallet = useWallet();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [localPayment, setLocalPayment] = useState<Payment>(payment);

  const receipt = localPayment.receipt;
  const isVerifiedOnchain = receipt?.is_blockchain_verified;

  const handleStoreProof = async () => {
    if (!receipt) return;
    setIsStoring(true);
    try {
      // 1. Connect wallet if not connected
      let currentAddress = wallet.walletAddress;
      if (!wallet.isConnected) {
        showToast("Connecting MetaMask...", "info");
        const addr = await wallet.connectWallet();
        if (!addr) {
          showToast("Wallet connection required to store proof.", "error");
          setIsStoring(false);
          return;
        }
        currentAddress = addr;
      }

      // 2. Request backend to generate/ensure Proof ID and Hash
      showToast("Preparing proof hash...", "info");
      const proofData = await paymentsService.generateProof(localPayment.id);
      
      // 3. Send transaction to Monad Testnet via MetaMask
      showToast("Confirm transaction in MetaMask...", "info");
      const txDetails = await wallet.storeProofOnChain(
        proofData.proof_id,
        proofData.receipt_hash
      );

      if (!txDetails) {
        throw new Error("Transaction could not be completed.");
      }

      // 4. Save metadata back to database
      showToast("Finalizing proof on database...", "info");
      const updatedReceipt = await paymentsService.storeProofMetadata(localPayment.id, {
        blockchain_tx_hash: txDetails.txHash,
        blockchain_wallet_address: currentAddress || "",
        blockchain_block_number: txDetails.blockNumber,
        blockchain_proof_id: proofData.proof_id,
      });

      // Update local state
      setLocalPayment((prev) => ({
        ...prev,
        receipt: updatedReceipt,
      }));

      showToast("Proof successfully anchored on Monad Testnet!", "success");
      if (onUpdate) onUpdate();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to anchor proof on Monad.", "error");
    } finally {
      setIsStoring(false);
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!receipt) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (receipt) {
      showToast("This payment already has a receipt.", "warning");
      return;
    }

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    
    // Validate file size and type
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      showToast("Only PDF, JPG, and PNG files are supported.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be under 5MB.", "error");
      return;
    }

    showToast(`Uploading receipt: ${file.name}...`, "info");
    try {
      const newReceipt = await paymentsService.uploadReceipt(localPayment.id, file);
      setLocalPayment(prev => ({
        ...prev,
        receipt: newReceipt
      }));
      showToast("Receipt uploaded successfully! Drag-and-drop complete.", "success");
      setIsExpanded(true); // Automatically expand to show options (like anchor proof)
      if (onUpdate) onUpdate();
    } catch (err: any) {
      showToast(err.message || "Failed to upload receipt.", "error");
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`p-4 rounded-xl border transition-all mb-3 last:mb-0 relative ${
        isDragging
          ? "border-[var(--color-accent)] bg-[var(--color-surface-secondary)] scale-[1.01] shadow-md"
          : "border-[var(--color-border-light)] bg-[var(--color-surface)] hover:shadow-sm hover:border-[var(--color-border)] hover:bg-[var(--color-surface-secondary)]"
      }`}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-[var(--color-accent)]/5 rounded-xl flex items-center justify-center pointer-events-none border-2 border-dashed border-[var(--color-accent)] z-10 animate-pulse">
          <p className="text-xs font-bold text-[var(--color-accent)] flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Drop Receipt File Here
          </p>
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Icon + Details */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">
              {showLoan ? localPayment.loan_name : "Repayment"}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {formatDate(localPayment.payment_date)} · {PAYMENT_METHOD_LABELS[localPayment.payment_method]}
            </p>
          </div>
        </div>

        {/* Right Side: Amount + Status Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-[15px] font-bold text-[var(--color-text-primary)]">
              {formatCurrency(parseFloat(localPayment.amount))}
            </p>
            <div className="flex items-center gap-1.5 justify-end mt-1">
              <span className={`${className} text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-md`}>
                {label}
              </span>
              {receipt && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`p-1 rounded-md transition-all ${isVerifiedOnchain ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 border border-[var(--color-border-light)]'} cursor-pointer`}
                  title={isVerifiedOnchain ? "Verified On-chain" : "Has Receipt"}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    {isVerifiedOnchain && <path d="m9 15 2 2 4-4" stroke="currentColor" strokeWidth="2.5" />}
                  </svg>
                </button>
              )}
            </div>
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(localPayment.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] hover:bg-red-50/50 border border-transparent hover:border-[var(--color-border-light)] transition-all cursor-pointer shrink-0"
              aria-label="Delete payment"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Blockchain / Receipt Details Section */}
      {isExpanded && receipt && (
        <div className="mt-3.5 p-4 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface-secondary)] space-y-3.5 animate-fade-in">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-bold text-[var(--color-text-primary)]">Receipt Document</p>
              <a
                href={receipt.file_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--color-accent)] hover:underline truncate max-w-[250px] inline-block mt-1 font-semibold"
              >
                {receipt.original_filename}
              </a>
              <p className="text-[10px] text-[var(--color-text-tertiary)] font-medium">
                {(receipt.file_size_bytes / 1024).toFixed(1)} KB · SHA-256: <span className="font-mono">{receipt.document_hash.slice(0, 12)}...</span>
              </p>
            </div>
            
            {!isVerifiedOnchain && (
              <button
                onClick={handleStoreProof}
                disabled={isStoring}
                className="btn btn-accent btn-sm text-xs flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/10 font-bold cursor-pointer"
              >
                {isStoring ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                      <line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                    <span>Anchor Proof on Monad</span>
                  </>
                )}
              </button>
            )}
          </div>

          {isVerifiedOnchain ? (
            <div className="pt-3 border-t border-[var(--color-border-light)] grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-bold">Blockchain Verification</span>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span>Verified Onchain (Monad Testnet)</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-bold">Proof ID (UUID)</span>
                <p className="font-mono text-[var(--color-text-secondary)] select-all truncate font-medium" title={receipt.blockchain_proof_id}>
                  {receipt.blockchain_proof_id}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-bold">Anchored Wallet</span>
                <p className="font-mono text-[var(--color-text-secondary)] select-all truncate font-medium" title={receipt.blockchain_wallet_address}>
                  {receipt.blockchain_wallet_address}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-bold">Transaction Hash</span>
                <div className="flex items-center gap-1">
                  <p className="font-mono text-[var(--color-text-secondary)] select-all truncate max-w-[150px] font-medium" title={receipt.blockchain_tx_hash}>
                    {receipt.blockchain_tx_hash}
                  </p>
                  <a
                    href={`https://testnet.monadscan.com/tx/${receipt.blockchain_tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-accent)] hover:underline inline-flex items-center gap-0.5"
                    title="View on Block Explorer"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                </div>
              </div>
              {receipt.blockchain_block_number && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-bold">Block Number</span>
                  <p className="font-mono text-[var(--color-text-secondary)] font-semibold">#{receipt.blockchain_block_number}</p>
                </div>
              )}
              {receipt.blockchain_anchored_at && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-bold">Timestamp</span>
                  <p className="text-[var(--color-text-secondary)] font-medium">{new Date(receipt.blockchain_anchored_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="pt-2 text-[11px] text-[var(--color-text-tertiary)] flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>This receipt's SHA-256 hash has not been anchored on the Monad Blockchain yet.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
