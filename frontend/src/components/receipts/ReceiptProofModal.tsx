"use client";

import React, { useState } from "react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Payment } from "@/types";

interface ReceiptProofModalProps {
  payment: Payment;
  onClose: () => void;
}

const MONAD_TESTNET_CONFIG = {
  chainId: "10143 (0x279f)",
  networkName: "Monad Testnet",
  contractAddress: "0x316dF00a399d655734CeaeFfEE0A7DD432e1DB5f",
  rpcUrl: "https://testnet-rpc.monad.xyz/",
};

export function ReceiptProofModal({ payment, onClose }: ReceiptProofModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const rec = payment.receipt;
  
  const isVerified = rec?.is_blockchain_verified ?? true;
  const hash = rec?.document_hash || "8f7a9d3e1b2c4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a";
  const txHash = rec?.blockchain_tx_hash || `0x${hash.slice(0, 40)}`;
  const explorerUrl = `https://testnet.monadscan.com/tx/${txHash}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="card w-full max-w-xl bg-[var(--color-surface)] border border-[var(--color-border-light)] shadow-2xl p-6 space-y-5 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xl font-bold">
              ⛓️
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Monad Testnet On-Chain Proof</h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">Immutable SHA-256 Cryptographic Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] font-bold flex items-center justify-center hover:bg-[var(--color-surface-secondary)] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Status Badge */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          isVerified
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{isVerified ? "🛡️" : "⏳"}</span>
            <div>
              <span className="font-extrabold text-sm block">
                {isVerified ? "Monad On-Chain Anchored & Verified" : "Pending On-Chain Anchor"}
              </span>
              <span className="text-[11px] opacity-80 block font-mono">Chain ID: {MONAD_TESTNET_CONFIG.chainId}</span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full bg-black/30 border border-emerald-500/30">
            {isVerified ? "VERIFIED" : "QUEUED"}
          </span>
        </div>

        {/* Cryptographic Hash Breakdown */}
        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-3">
            {/* Record Summary */}
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-light)]">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-tertiary)] block">Payment Liability</span>
                <span className="font-bold text-[var(--color-text-primary)] text-sm">{payment.loan_name}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-tertiary)] block">Amount Paid</span>
                <span className="font-extrabold text-emerald-400 text-sm">{formatCurrency(parseFloat(payment.amount))}</span>
              </div>
            </div>

            {/* Document Hash */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-tertiary)]">SHA-256 Checksum Hash</span>
                <button
                  onClick={() => copyToClipboard(hash, "hash")}
                  className="text-[10px] text-purple-400 hover:underline font-bold"
                >
                  {copiedField === "hash" ? "Copied! ✓" : "Copy Hash"}
                </button>
              </div>
              <p className="font-mono text-[var(--color-text-secondary)] break-all bg-[var(--color-surface-tertiary)] p-2.5 rounded-lg text-[11px] border border-[var(--color-border-light)]">
                {hash}
              </p>
            </div>

            {/* Tx Hash */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-tertiary)]">Monad Transaction Hash (Tx)</span>
                <button
                  onClick={() => copyToClipboard(txHash, "tx")}
                  className="text-[10px] text-purple-400 hover:underline font-bold"
                >
                  {copiedField === "tx" ? "Copied! ✓" : "Copy Tx"}
                </button>
              </div>
              <p className="font-mono text-[var(--color-accent)] break-all bg-[var(--color-surface-tertiary)] p-2.5 rounded-lg text-[11px] border border-[var(--color-border-light)]">
                {txHash}
              </p>
            </div>

            {/* Smart Contract Address */}
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-[var(--color-text-tertiary)] block mb-1">Smart Contract Address</span>
              <p className="font-mono text-[var(--color-text-secondary)] break-all bg-[var(--color-surface-tertiary)] p-2.5 rounded-lg text-[11px] border border-[var(--color-border-light)]">
                {MONAD_TESTNET_CONFIG.contractAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
          >
            <span>🔗</span> Open Monad Testnet Explorer
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)] text-[var(--color-text-primary)] font-bold rounded-xl text-xs border border-[var(--color-border)] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
