/**
 * DebtProof — Wallet Information Card
 * Displays blockchain wallet connection status, balances, network warning, and configuration for Monad Testnet.
 */
"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { BrowserProvider, ethers } from "ethers";
import { MONAD_TESTNET_PARAMS } from "@/utils/contract";
import { useToast } from "@/components/ui/Toast";

export function WalletCard() {
  const wallet = useWallet();
  const { showToast } = useToast();
  const [balance, setBalance] = useState<string>("0.00");
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    if (wallet.isConnected && wallet.walletAddress) {
      setLoadingBalance(true);
      if (typeof window !== "undefined" && window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        provider.getBalance(wallet.walletAddress)
          .then((bal) => {
            if (active) {
              setBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
            }
          })
          .catch(() => {
            if (active) setBalance("0.0000");
          })
          .finally(() => {
            if (active) setLoadingBalance(false);
          });
      }
    } else {
      setBalance("0.0000");
      setLoadingBalance(false);
    }

    return () => {
      active = false;
    };
  }, [wallet.isConnected, wallet.walletAddress, wallet.isWrongNetwork]);

  useEffect(() => {
    if (wallet.error) {
      showToast(wallet.error, "error");
    }
  }, [wallet.error, showToast]);

  const handleCopy = () => {
    if (!wallet.walletAddress) return;
    navigator.clipboard.writeText(wallet.walletAddress);
    setCopied(true);
    showToast("Wallet address copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="card p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${wallet.isConnected ? (wallet.isWrongNetwork ? "bg-[var(--color-warning)] animate-pulse" : "bg-[var(--color-accent)] animate-pulse") : "bg-[var(--color-text-tertiary)]"}`} />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            Blockchain Wallet
          </h2>
        </div>
        {wallet.isConnected && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            wallet.isWrongNetwork 
              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          }`}>
            {wallet.isWrongNetwork ? "Wrong Network" : "Connected"}
          </span>
        )}
      </div>

      {wallet.isConnected ? (
        <div className="space-y-3.5">
          {/* Address display */}
          <div className="flex items-center justify-between gap-3 bg-[var(--color-surface-secondary)] p-3 rounded-xl border border-[var(--color-border-light)]">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">Address</span>
              <p className="font-mono text-xs text-[var(--color-text-primary)] truncate font-semibold">
                {wallet.walletAddress}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-text-tertiary)] rounded-lg transition-all shrink-0 cursor-pointer"
              title="Copy Address"
            >
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>

          {/* Balance display */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--color-surface-secondary)] p-3 rounded-xl border border-[var(--color-border-light)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">Balance</span>
              <p className="text-sm font-bold text-[var(--color-text-primary)] mt-0.5">
                {loadingBalance ? "..." : `${balance} MON`}
              </p>
            </div>
            <div className="bg-[var(--color-surface-secondary)] p-3 rounded-xl border border-[var(--color-border-light)]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">Network</span>
              <p className="text-xs font-semibold text-[var(--color-text-primary)] mt-1 truncate">
                {wallet.isWrongNetwork ? "Unsupported" : "Monad Testnet"}
              </p>
            </div>
          </div>

          {/* Warning / Actions */}
          {wallet.isWrongNetwork ? (
            <div className="p-3 rounded-xl border border-rose-500/10 bg-rose-500/5 text-rose-300 text-xs space-y-2">
              <p className="font-semibold text-rose-200">Wrong network detected!</p>
              <p className="text-[11px] leading-relaxed">
                DebtProof requires your wallet to be on the Monad Testnet (Chain ID 10143) to anchor repayment receipts.
              </p>
              <button
                onClick={wallet.switchToMonadTestnet}
                className="w-full btn btn-sm bg-rose-600 hover:bg-rose-700 text-white border-0 mt-1 cursor-pointer font-bold"
              >
                Switch to Monad Testnet
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 pt-2">
              <a
                href={`https://testnet.monadscan.com/address/${wallet.walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--color-primary-light)] hover:underline inline-flex items-center gap-1 font-semibold"
              >
                Explorer View
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
              <button
                onClick={wallet.disconnectWallet}
                className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] transition-colors cursor-pointer font-semibold"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 space-y-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] flex items-center justify-center mx-auto text-[var(--color-text-tertiary)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M16 10h4v4h-4z"/>
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-[var(--color-text-primary)]">Wallet Disconnected</p>
            <p className="text-[11px] text-[var(--color-text-secondary)] px-4 leading-relaxed">
              Connect MetaMask to anchor and verify proof of your repayments on Monad Testnet.
            </p>
          </div>
          <button
            onClick={wallet.connectWallet}
            disabled={wallet.isConnecting}
            className="btn btn-accent btn-sm w-full font-bold cursor-pointer"
          >
            {wallet.isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        </div>
      )}
    </article>
  );
}
