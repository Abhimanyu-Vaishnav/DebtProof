"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { MONAD_TESTNET_PARAMS } from "@/utils/contract";

export function Web3WalletConnect() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0.00");
  const [chainId, setChainId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isMonadNetwork = chainId === "0x279f" || chainId === "10143";

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const checkWallet = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        const network = await provider.getNetwork();
        setChainId("0x" + network.chainId.toString(16));

        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const bal = await provider.getBalance(accounts[0]);
          setBalance(parseFloat(ethers.formatEther(bal)).toFixed(3));
        }
      } catch (err) {
        console.error("Error checking Web3 wallet:", err);
      }
    };

    checkWallet();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        checkWallet();
      } else {
        setAccount(null);
      }
    };

    const handleChainChanged = (newChainId: string) => {
      setChainId(newChainId);
      checkWallet();
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("No EVM wallet detected. Please install MetaMask, Rabby, or Coinbase Wallet!");
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await switchToMonad();
      }
    } catch (err: any) {
      console.error("Failed to connect wallet:", err);
    } finally {
      setLoading(false);
    }
  };

  const switchToMonad = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MONAD_TESTNET_PARAMS.chainId }],
      });
    } catch (switchError: any) {
      // Chain 10143 not added yet, add Monad Testnet
      if (switchError.code === 4902 || switchError.message?.includes("Unrecognized chain")) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [MONAD_TESTNET_PARAMS],
          });
        } catch (addError) {
          console.error("Failed to add Monad Testnet:", addError);
        }
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      {account ? (
        <div className="flex items-center gap-2 bg-[var(--color-surface-secondary)] border border-[var(--color-border)] p-1 pl-2.5 rounded-xl text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isMonadNetwork ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span className="font-bold text-[var(--color-text-primary)]">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 font-black border border-purple-500/20">
            <span>{balance} MON</span>
          </div>

          {!isMonadNetwork && (
            <button
              onClick={switchToMonad}
              className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold text-[10px] hover:bg-amber-500/30 transition cursor-pointer"
            >
              Switch to Monad
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
        >
          <span>🦊</span>
          <span>{loading ? "Connecting..." : "Connect Web3"}</span>
        </button>
      )}
    </div>
  );
}

export default Web3WalletConnect;
