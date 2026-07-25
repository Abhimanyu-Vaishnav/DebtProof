"use client";

import React from "react";
import { Topbar } from "@/components/layout/Topbar";
import { ZkCreditProofStudio } from "@/components/zk-proofs/ZkCreditProofStudio";
import { OnChainBadgeGallery } from "@/components/zk-proofs/OnChainBadgeGallery";

export default function ZkProofsPage() {
  return (
    <>
      <Topbar
        title="ZK Credit Proofs & Badges"
        subtitle="Cryptographic zero-knowledge verification & Monad SBT badge gallery"
      />

      <main className="page-content space-y-6 pb-12">
        {/* Top Hero Banner */}
        <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-6 md:p-8 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                ⚡ Web3 Zero-Knowledge Engine
              </span>
              <span className="text-xs text-[var(--color-text-tertiary)] font-mono font-bold">Monad Blockchain Integration</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
              ZK Credit Proofs & Monad Soulbound Badges
            </h1>

            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-medium">
              Generate verifiable, privacy-preserving zero-knowledge mathematical proofs of your credit score, payment history, and solvency ratios. Mint non-transferable Soulbound Badges (SBTs) on the Monad Blockchain to share cryptographic reputational receipts with lenders and Web3 P2P pools.
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>SHA-256 Hashes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>zk-SNARK Ready</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Monad Testnet (Chain 10143)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Studio Component */}
        <ZkCreditProofStudio />

        {/* Badge Gallery Component */}
        <OnChainBadgeGallery />
      </main>
    </>
  );
}
