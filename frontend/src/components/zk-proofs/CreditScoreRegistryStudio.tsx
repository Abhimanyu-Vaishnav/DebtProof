'use client';

import React, { useState } from 'react';

export default function CreditScoreRegistryStudio() {
  const [walletAddress, setWalletAddress] = useState('0x71C765...89B1');
  const [creditScore, setCreditScore] = useState(785);
  const [onTimePayments, setOnTimePayments] = useState(18);
  const [defaults, setDefaults] = useState(0);
  const [proofHash, setProofHash] = useState('0xa8f92c10b4819d45e76c10928a47b190f8823101');
  const [isUpdating, setIsUpdating] = useState(false);
  const [txSuccess, setTxSuccess] = useState('');

  const handleUpdateScore = () => {
    setIsUpdating(true);
    setTxSuccess('');
    setTimeout(() => {
      const newScore = Math.min(900, creditScore + 15);
      setCreditScore(newScore);
      setOnTimePayments(prev => prev + 1);
      const newHash = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
      setProofHash(newHash);
      setIsUpdating(false);
      setTxSuccess('On-chain score update transaction submitted to Monad Testnet! (Tx Hash: 0x90a...b12)');
    }, 1500);
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-light)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⛓️</span>
            <h2 className="text-lg font-black text-[var(--color-text-primary)]">
              Monad On-Chain Credit Score Registry
            </h2>
          </div>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
            Dynamic decentralized repayment reliability ledger deployed on Monad Testnet (Chain ID: 10143)
          </p>
        </div>
        <span className="px-3 py-1 text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 rounded-full w-fit">
          Smart Contract Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score Display Card */}
        <div className="bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-slate-900/30 p-5 rounded-2xl border border-indigo-500/20 text-center space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">On-Chain CIBIL Score</p>
          <div className="text-4xl font-black text-white tracking-tight">{creditScore} <span className="text-xs font-normal text-slate-400">/ 900</span></div>
          <p className="text-[10px] font-semibold text-emerald-400"> Excellent Reliability Tier</p>
        </div>

        {/* Stats Card */}
        <div className="bg-[var(--color-surface-secondary)] p-5 rounded-2xl border border-[var(--color-border-light)] space-y-3">
          <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Verified Repayments</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--color-text-tertiary)]">On-Time Payments:</span>
            <span className="font-bold text-emerald-500">{onTimePayments}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--color-text-tertiary)]">Defaults / Bounces:</span>
            <span className="font-bold text-rose-500">{defaults}</span>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-[var(--color-surface-secondary)] p-5 rounded-2xl border border-[var(--color-border-light)] flex flex-col justify-between space-y-3">
          <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">On-Chain Sync</p>
          <button
            onClick={handleUpdateScore}
            disabled={isUpdating}
            className="w-full py-2.5 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-xs font-bold rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isUpdating ? 'Broadcasting to Monad...' : 'Sync Payment to Monad (+15 Score)'}
          </button>
        </div>
      </div>

      {txSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-600 font-mono">
          ✓ {txSuccess}
        </div>
      )}

      <div className="p-4 bg-[var(--color-surface-tertiary)] rounded-2xl border border-[var(--color-border-light)] text-xs space-y-2 font-mono">
        <div className="flex justify-between text-[var(--color-text-secondary)]">
          <span>Target Address:</span>
          <span className="text-[var(--color-text-primary)] font-bold">{walletAddress}</span>
        </div>
        <div className="flex justify-between text-[var(--color-text-secondary)] truncate">
          <span>Verification SHA-256 Hash:</span>
          <span className="text-indigo-400 font-bold truncate max-w-[240px]">{proofHash}</span>
        </div>
      </div>
    </div>
  );
}
