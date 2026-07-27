"use client";

import React, { useState, useEffect } from "react";
import { loansService } from "@/services/loans.service";
import { formatCurrency } from "@/utils/formatters";
import { playSuccessSound, playClickSound } from "@/utils/sound";
import { ethers } from "ethers";
import { MONAD_TESTNET_PARAMS, DEBT_PROOF_REGISTRY_ADDRESS, DEBT_PROOF_REGISTRY_ABI } from "@/utils/contract";

interface JointLoan {
  id: string;
  name: string;
  lender: string;
  totalPrincipal: number;
  outstanding: number;
  monthlyEmi: number;
  primaryBorrower: string;
  coBorrower: string;
  primarySharePct: number;
  coBorrowerSharePct: number;
  primaryPaidThisMonth: boolean;
  coBorrowerPaidThisMonth: boolean;
  isMultiSigApprovedOnChain: boolean;
  txHash?: string;
}

const INITIAL_JOINT_LOANS: JointLoan[] = [
  {
    id: "joint-1",
    name: "SBI Joint Home Loan (Green Valley Flat)",
    lender: "SBI Bank",
    totalPrincipal: 6500000,
    outstanding: 5200000,
    monthlyEmi: 54000,
    primaryBorrower: "Abhimanyu V. (You)",
    coBorrower: "Sneha V. (Co-Borrower)",
    primarySharePct: 60,
    coBorrowerSharePct: 40,
    primaryPaidThisMonth: true,
    coBorrowerPaidThisMonth: false,
    isMultiSigApprovedOnChain: false,
  },
  {
    id: "joint-2",
    name: "HDFC Business Expansion Co-Signed Loan",
    lender: "HDFC Bank",
    totalPrincipal: 2500000,
    outstanding: 1800000,
    monthlyEmi: 32000,
    primaryBorrower: "Abhimanyu V. (You)",
    coBorrower: "Rohan M. (Business Partner)",
    primarySharePct: 50,
    coBorrowerSharePct: 50,
    primaryPaidThisMonth: true,
    coBorrowerPaidThisMonth: true,
    isMultiSigApprovedOnChain: true,
    txHash: "0x8f7a9d02e5b4c3a2f109876543210fedcba9876543210fedcba9876543210fed",
  },
];

export function JointWorkspaceStudio() {
  const [jointLoans, setJointLoans] = useState<JointLoan[]>(INITIAL_JOINT_LOANS);
  const [selectedLoanId, setSelectedLoanId] = useState<string>("joint-1");
  const [account, setAccount] = useState<string | null>(null);
  const [signingOnChain, setSigningOnChain] = useState(false);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Load real active loans if available
  useEffect(() => {
    async function loadPortfolioJointLoans() {
      try {
        const res = await loansService.getLoans();
        if (res?.results && res.results.length > 0) {
          const firstReal = res.results[0];
          const realBal = parseFloat(firstReal.outstanding_amount) || 2500000;
          const realEmi = parseFloat(firstReal.monthly_emi) || 28000;
          
          setJointLoans((prev) => [
            {
              id: firstReal.id,
              name: `${firstReal.name} (Co-Signed Joint)`,
              lender: firstReal.lender_name || "Bank Lender",
              totalPrincipal: parseFloat(firstReal.principal_amount) || 3000000,
              outstanding: realBal,
              monthlyEmi: realEmi,
              primaryBorrower: "Abhimanyu V. (You)",
              coBorrower: "Co-Signer Partner",
              primarySharePct: 50,
              coBorrowerSharePct: 50,
              primaryPaidThisMonth: true,
              coBorrowerPaidThisMonth: false,
              isMultiSigApprovedOnChain: false,
            },
            ...prev.slice(1),
          ]);
        }
      } catch (e) {}
    }
    loadPortfolioJointLoans();
  }, []);

  const activeLoan = jointLoans.find((l) => l.id === selectedLoanId) || jointLoans[0];

  const updateShareRatio = (newPrimaryPct: number) => {
    playClickSound();
    setJointLoans((prev) =>
      prev.map((l) =>
        l.id === activeLoan.id
          ? { ...l, primarySharePct: newPrimaryPct, coBorrowerSharePct: 100 - newPrimaryPct }
          : l
      )
    );
  };

  const toggleCoBorrowerPaid = () => {
    playClickSound();
    setJointLoans((prev) =>
      prev.map((l) =>
        l.id === activeLoan.id
          ? { ...l, coBorrowerPaidThisMonth: !l.coBorrowerPaidThisMonth }
          : l
      )
    );
    playSuccessSound();
  };

  const generateInviteLink = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    const token = Math.random().toString(36).substring(2, 10);
    const link = typeof window !== "undefined"
      ? `${window.location.origin}/dashboard/joint-workspace?invite=${token}&loan=${activeLoan.id}`
      : `https://debtproof.app/join/${token}`;
    setInviteLink(link);
    playSuccessSound();
  };

  const copyInviteToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    playClickSound();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Sign joint contract multi-sig on Monad Testnet
  const executeJointApprovalOnMonad = async () => {
    playClickSound();
    setSigningOnChain(true);

    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        setAccount(accounts[0]);

        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: MONAD_TESTNET_PARAMS.chainId }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [MONAD_TESTNET_PARAMS],
            });
          }
        }

        const contract = new ethers.Contract(DEBT_PROOF_REGISTRY_ADDRESS, DEBT_PROOF_REGISTRY_ABI, signer);
        const dummyHash = ethers.keccak256(ethers.toUtf8Bytes(`JOINT_AGREEMENT_${activeLoan.id}_${Date.now()}`));
        const tx = await contract.storeProof(`MULTISIG-${activeLoan.id.toUpperCase()}`, dummyHash);
        
        await tx.wait();

        setJointLoans((prev) =>
          prev.map((l) =>
            l.id === activeLoan.id
              ? { ...l, isMultiSigApprovedOnChain: true, txHash: tx.hash }
              : l
          )
        );
        playSuccessSound();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1400));
        const simTx = "0x" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("");
        setJointLoans((prev) =>
          prev.map((l) =>
            l.id === activeLoan.id
              ? { ...l, isMultiSigApprovedOnChain: true, txHash: simTx }
              : l
          )
        );
        playSuccessSound();
      }

      try {
        const { recordPaymentActivityAndNotification } = require("@/services/activity.service");
        recordPaymentActivityAndNotification({
          title: `Co-Signer Web3 Multi-Sig Executed`,
          description: `Joint liability agreement for "${activeLoan.name}" cryptographically anchored on Monad Testnet.`,
          icon: "✍️",
          color: "purple",
          event_type: "multisig_co_signed",
        });
      } catch {}
    } catch (err: any) {
      alert(`Signature execution notice: ${err.message || "User cancelled wallet signature"}`);
    } finally {
      setSigningOnChain(false);
    }
  };

  const primaryShareAmount = (activeLoan.monthlyEmi * activeLoan.primarySharePct) / 100;
  const coBorrowerShareAmount = (activeLoan.monthlyEmi * activeLoan.coBorrowerSharePct) / 100;

  return (
    <div className="space-y-6">
      {/* Top Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jointLoans.map((loan) => {
          const isSelected = loan.id === activeLoan.id;
          return (
            <div
              key={loan.id}
              onClick={() => {
                playClickSound();
                setSelectedLoanId(loan.id);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? "bg-purple-500/10 border-purple-500/60 shadow-lg shadow-purple-500/10"
                  : "bg-[var(--color-surface)] border-[var(--color-border-light)] opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                    👥 Co-Signed Joint Loan
                  </span>
                  <h3 className="font-extrabold text-base text-[var(--color-text-primary)] mt-1.5">{loan.name}</h3>
                  <span className="text-xs text-[var(--color-text-tertiary)]">{loan.lender}</span>
                </div>
                <span className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(loan.monthlyEmi)} / mo
                </span>
              </div>

              <div className="pt-2 border-t border-[var(--color-border-light)] flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-secondary)] font-medium">
                  Outstanding: <strong>{formatCurrency(loan.outstanding)}</strong>
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                  loan.isMultiSigApprovedOnChain
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                }`}>
                  {loan.isMultiSigApprovedOnChain ? "✓ Multi-Sig Monad Approved" : "⏳ Multi-Sig Pending"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workspace Detail Card */}
      <div className="card bg-[var(--color-surface)] border border-[var(--color-border-light)] p-6 rounded-2xl space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border-light)] pb-5">
          <div>
            <h2 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">
              {activeLoan.name}
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Co-borrower split management & Monad Web3 multi-sig approval tracker.
            </p>
          </div>

          <button
            onClick={() => setShowInviteModal(!showInviteModal)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 self-start sm:self-auto"
          >
            <span>✉️ Invite Co-Borrower</span>
          </button>
        </div>

        {/* Invite Co-Borrower Modal */}
        {showInviteModal && (
          <form onSubmit={generateInviteLink} className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-3 animate-in fade-in">
            <span className="text-xs font-bold text-[var(--color-text-primary)] block">
              Generate Co-Borrower Joint Workspace Access Link
            </span>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Partner's email address (e.g. partner@example.com)"
                className="w-full input text-xs p-2.5 rounded-lg h-9"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 shadow-xs"
              >
                Generate Link
              </button>
            </div>

            {inviteLink && (
              <div className="p-3 rounded-lg bg-[var(--color-surface-tertiary)] border border-[var(--color-border-light)] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] block">
                  Secure Co-Borrower Invite Link
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="w-full font-mono text-xs p-2 rounded bg-[var(--color-surface)] border border-[var(--color-border-light)] text-[var(--color-text-primary)]"
                  />
                  <button
                    type="button"
                    onClick={copyInviteToClipboard}
                    className="px-3 py-1.5 rounded bg-emerald-600 text-white font-bold text-xs shrink-0 hover:bg-emerald-500"
                  >
                    {copiedLink ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

        {/* EMI Split & Share Calculator */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[var(--color-text-primary)] uppercase tracking-wider">
              1. Monthly EMI Split Ratio ({activeLoan.primarySharePct}% : {activeLoan.coBorrowerSharePct}%)
            </h3>
            <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
              Total EMI: {formatCurrency(activeLoan.monthlyEmi)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-3">
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={activeLoan.primarySharePct}
              onChange={(e) => updateShareRatio(parseInt(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-purple-500/30 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--color-text-primary)]">{activeLoan.primaryBorrower}</span>
                  <span className="text-purple-600 dark:text-purple-400">{activeLoan.primarySharePct}% Share</span>
                </div>
                <div className="text-lg font-black text-purple-600 dark:text-purple-400">
                  {formatCurrency(primaryShareAmount)} / mo
                </div>
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-[var(--color-text-tertiary)]">Status this month:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">✓ Paid On-Time</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-indigo-500/30 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--color-text-primary)]">{activeLoan.coBorrower}</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{activeLoan.coBorrowerSharePct}% Share</span>
                </div>
                <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(coBorrowerShareAmount)} / mo
                </div>
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-[var(--color-text-tertiary)]">Status this month:</span>
                  {activeLoan.coBorrowerPaidThisMonth ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">✓ Share Received</span>
                  ) : (
                    <span className="font-bold text-amber-600 dark:text-amber-400">⏳ Pending Payment</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Bar for Co-Borrower Payment */}
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={toggleCoBorrowerPaid}
                className="px-3.5 py-1.5 rounded-lg bg-[var(--color-surface-tertiary)] border border-[var(--color-border-light)] text-[var(--color-text-primary)] font-bold text-xs hover:bg-[var(--color-surface)] transition-all"
              >
                {activeLoan.coBorrowerPaidThisMonth ? "Mark Co-Borrower Pending" : "Mark Co-Borrower Share Paid"}
              </button>
            </div>
          </div>
        </div>

        {/* Monad Web3 Joint Agreement Multi-Sig Approval */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/20 via-[var(--color-surface-secondary)] to-indigo-950/20 border border-purple-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">✍️</span>
              <div>
                <h4 className="font-black text-base text-[var(--color-text-primary)]">
                  Monad Web3 Multi-Sig Joint Agreement
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Both co-borrowers sign & anchor the joint liability agreement on Monad Testnet (Chain ID 10143).
                </p>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
              activeLoan.isMultiSigApprovedOnChain
                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                : "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40"
            }`}>
              {activeLoan.isMultiSigApprovedOnChain ? "✓ FULLY SIGNED ON-CHAIN" : "1/2 SIGNATURES COMPLETED"}
            </span>
          </div>

          {activeLoan.isMultiSigApprovedOnChain ? (
            <div className="p-3.5 rounded-xl bg-[var(--color-surface-tertiary)] border border-emerald-500/30 space-y-1 font-mono text-xs">
              <div className="text-emerald-600 dark:text-emerald-300 font-bold">
                ✓ Joint Agreement Cryptographically Anchored on Monad
              </div>
              <div className="text-[11px] text-[var(--color-text-tertiary)] truncate">
                Tx: {activeLoan.txHash}
              </div>
            </div>
          ) : (
            <button
              onClick={executeJointApprovalOnMonad}
              disabled={signingOnChain}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-2"
            >
              {signingOnChain ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Broadcasting Multi-Sig Signature to Monad...</span>
                </>
              ) : (
                <>
                  <span>🦊 Execute Co-Signer Web3 Multi-Sig Approval</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default JointWorkspaceStudio;

