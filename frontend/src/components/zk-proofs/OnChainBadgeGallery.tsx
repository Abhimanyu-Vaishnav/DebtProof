"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { MONAD_TESTNET_PARAMS, DEBT_PROOF_REGISTRY_ADDRESS, DEBT_PROOF_REGISTRY_ABI } from "@/utils/contract";
import { playSuccessSound, playClickSound } from "@/utils/sound";

interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  rarity: "Legendary" | "Epic" | "Rare" | "Common";
  badgeBgClass: string;
  badgeTextClass: string;
  borderColorClass: string;
  txHash?: string;
}

const BADGE_LIST: BadgeItem[] = [
  {
    id: "badge_debt_free",
    title: "Debt-Free Pioneer",
    description: "Minted upon paying off 100% of an active loan liability balance.",
    icon: "🏆",
    category: "Milestone",
    rarity: "Legendary",
    badgeBgClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40",
    badgeTextClass: "text-amber-600 dark:text-amber-400",
    borderColorClass: "hover:border-amber-500/80 border-amber-500/30",
  },
  {
    id: "badge_12m_streak",
    title: "12-Month EMI Streak",
    description: "Awarded for 12 consecutive months of punctual EMI repayments anchored on-chain.",
    icon: "🔥",
    category: "Repayment",
    rarity: "Epic",
    badgeBgClass: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40",
    badgeTextClass: "text-purple-600 dark:text-purple-400",
    borderColorClass: "hover:border-purple-500/80 border-purple-500/30",
  },
  {
    id: "badge_zero_default",
    title: "Zero Default Shield",
    description: "Cryptographic assertion of zero loan defaults or penalty breaches.",
    icon: "🛡️",
    category: "Trust Rating",
    rarity: "Rare",
    badgeBgClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
    badgeTextClass: "text-emerald-600 dark:text-emerald-400",
    borderColorClass: "hover:border-emerald-500/80 border-emerald-500/30",
  },
  {
    id: "badge_low_utilization",
    title: "Credit Master (< 30%)",
    description: "Maintained total credit card revolving limit utilization below 30%.",
    icon: "💎",
    category: "Financial Health",
    rarity: "Rare",
    badgeBgClass: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/40",
    badgeTextClass: "text-blue-600 dark:text-blue-400",
    borderColorClass: "hover:border-blue-500/80 border-blue-500/30",
  },
];

export function OnChainBadgeGallery() {
  const [badges, setBadges] = useState<BadgeItem[]>(BADGE_LIST);
  const [mintingId, setMintingId] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnectedWallet = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.send("eth_accounts", []);
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            loadSavedMintedBadges(accounts[0]);
          }
        } catch (err) {
          console.error("Error checking wallet connection:", err);
        }
      }
    };
    checkConnectedWallet();
  }, []);

  const loadSavedMintedBadges = (walletAddr: string) => {
    try {
      const saved = localStorage.getItem(`debtproof_minted_badges_${walletAddr.toLowerCase()}`);
      if (saved) {
        const parsedMap: Record<string, string> = JSON.parse(saved);
        setBadges((prev) =>
          prev.map((b) => (parsedMap[b.id] ? { ...b, txHash: parsedMap[b.id] } : b))
        );
      }
    } catch (e) {}
  };

  const connectWallet = async (): Promise<string | null> => {
    playClickSound();
    setStatusMessage(null);

    if (typeof window === "undefined" || !window.ethereum) {
      alert("MetaMask wallet is not installed in your browser. Please install MetaMask to interact with Monad Testnet.");
      return null;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        const selected = accounts[0];
        setAccount(selected);
        loadSavedMintedBadges(selected);
        playSuccessSound();
        return selected;
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setStatusMessage("Wallet connection was rejected or failed.");
    }
    return null;
  };

  const mintBadgeOnMonad = async (badgeId: string) => {
    playClickSound();
    setStatusMessage(null);

    let activeAccount = account;
    if (!activeAccount) {
      activeAccount = await connectWallet();
      if (!activeAccount) {
        return; // User did not connect wallet
      }
    }

    setMintingId(badgeId);

    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask is required to mint on Monad Testnet.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Ensure connected to Monad Testnet (Chain ID 10143 / 0x279f)
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MONAD_TESTNET_PARAMS.chainId }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_TESTNET_PARAMS],
          });
        }
      }

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(DEBT_PROOF_REGISTRY_ADDRESS, DEBT_PROOF_REGISTRY_ABI, signer);
      
      const badgeProofHash = ethers.keccak256(ethers.toUtf8Bytes(`MONAD_SBT_BADGE_${badgeId.toUpperCase()}_${activeAccount}_${Date.now()}`));
      
      setStatusMessage("Please confirm transaction in your MetaMask wallet...");
      const tx = await contract.storeProof(`SBT-${badgeId.toUpperCase()}`, badgeProofHash);
      
      setStatusMessage(`Transaction submitted: ${tx.hash.substring(0, 14)}... Waiting for block confirmation on Monad...`);
      await tx.wait();

      const realTxHash = tx.hash;

      // Save minted badge state
      setBadges((prev) =>
        prev.map((b) => (b.id === badgeId ? { ...b, txHash: realTxHash } : b))
      );

      // Persist in localStorage for this wallet
      try {
        const key = `debtproof_minted_badges_${activeAccount.toLowerCase()}`;
        const existing = JSON.parse(localStorage.getItem(key) || "{}");
        existing[badgeId] = realTxHash;
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (e) {}

      setStatusMessage(`🎉 Successfully minted badge on Monad Blockchain! Tx: ${realTxHash.substring(0, 16)}...`);
      playSuccessSound();
    } catch (err: any) {
      console.error("Monad minting transaction failed or rejected:", err);
      const errMsg = err?.reason || err?.message || "Transaction cancelled or failed.";
      setStatusMessage(`❌ Error: ${errMsg.length > 80 ? errMsg.substring(0, 80) + '...' : errMsg}`);
    } finally {
      setMintingId(null);
    }
  };

  return (
    <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-6 space-y-6 shadow-xl relative overflow-hidden rounded-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border-light)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              🏅 Monad Soulbound Tokens (SBT)
            </span>
            <span className="text-xs text-[var(--color-text-tertiary)] font-mono font-bold">Chain ID: 10143</span>
          </div>
          <h3 className="text-xl font-black text-[var(--color-text-primary)] mt-1.5 tracking-tight">
            On-Chain Achievement Badge Gallery
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">
            Mint non-transferable proof tokens directly onto the Monad Blockchain to display your verified financial reputation.
          </p>
        </div>

        <div>
          {account ? (
            <div className="px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/40 text-purple-700 dark:text-purple-300 font-mono text-xs font-bold flex items-center gap-2 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
            </div>
          ) : (
            <button
              onClick={() => connectWallet()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs transition-all shadow-md shadow-purple-600/25 flex items-center gap-2 active:scale-95"
            >
              <span>🦊 Connect MetaMask Wallet</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Alert Banner if any */}
      {statusMessage && (
        <div className={`p-3 rounded-xl text-xs font-mono font-bold border ${
          statusMessage.includes("❌")
            ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
            : statusMessage.includes("🎉")
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
            : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
        }`}>
          {statusMessage}
        </div>
      )}

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        {badges.map((badge) => {
          const isMinting = mintingId === badge.id;
          const isMinted = Boolean(badge.txHash);

          return (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl bg-[var(--color-surface-secondary)] border-2 ${badge.borderColorClass} flex flex-col justify-between space-y-4 relative transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl`}
            >
              {/* Rarity & Icon Badge */}
              <div className="flex items-center justify-between">
                <span className="text-3xl filter drop-shadow-md">{badge.icon}</span>
                <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full border ${badge.badgeBgClass}`}>
                  {badge.rarity}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-base text-[var(--color-text-primary)]">{badge.title}</h4>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-medium">
                  {badge.description}
                </p>
              </div>

              {/* Mint Button / Tx Status */}
              <div className="pt-3 border-t border-[var(--color-border-light)]">
                {isMinted ? (
                  <div className="space-y-2">
                    <span className="inline-block text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
                      ✓ MINTED ON MONAD
                    </span>
                    <a
                      href={`https://testnet.monadscan.com/tx/${badge.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs font-mono text-purple-600 dark:text-purple-400 font-bold hover:underline truncate"
                    >
                      Tx: {badge.txHash?.substring(0, 14)}...
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={() => mintBadgeOnMonad(badge.id)}
                    disabled={isMinting}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 active:scale-95"
                  >
                    {isMinting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Minting on Monad...</span>
                      </>
                    ) : (
                      <>
                        <span>{account ? "✨ Mint SBT Badge" : "🦊 Connect & Mint"}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
