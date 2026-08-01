"use client";

import React, { useState } from "react";
import { Award, ShieldCheck, Sparkles, ExternalLink, CheckCircle2, Lock, Loader2 } from "lucide-react";

interface SoulboundCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanName: string;
  lenderName: string;
  principalAmount: number;
  paidOffDate?: string;
  loanId: string;
}

export function SoulboundCertificateModal({
  isOpen,
  onClose,
  loanName,
  lenderName,
  principalAmount,
  paidOffDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  loanId,
}: SoulboundCertificateModalProps) {
  const [isMinting, setIsMinting] = useState(false);
  const [mintedTx, setMintedTx] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleMintSoulboundNFT = async () => {
    setIsMinting(true);
    try {
      // Simulate Monad Testnet Web3 Contract Call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const mockTxHash = "0x7a91f" + Math.random().toString(16).substring(2, 10) + "b84e1904a" + Math.random().toString(16).substring(2, 8);
      setMintedTx(mockTxHash);
    } catch (err) {
      console.error("NFT Minting failed:", err);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl shadow-emerald-900/20 text-slate-100">
        {/* Certificate Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-center relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 opacity-20 pointer-events-none">
            <Award className="w-48 h-48 text-white" />
          </div>
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-full mb-3 border border-white/20 shadow-inner">
            <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase">Soulbound NFT Certificate</h2>
          <p className="text-emerald-100 text-xs mt-1 font-medium tracking-wide">
            Immutable Proof of Financial Freedom • Monad Blockchain
          </p>
        </div>

        {/* Certificate Card Content */}
        <div className="p-6 space-y-6">
          <div className="border border-emerald-500/20 bg-emerald-950/20 rounded-xl p-5 relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Certificate of Payoff</span>
                <h3 className="text-xl font-bold text-slate-100 mt-0.5">{loanName}</h3>
                <p className="text-sm text-slate-400">{lenderName}</p>
              </div>
              <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Soulbound
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-800/80 my-2 text-sm">
              <div>
                <span className="text-xs text-slate-400 block">Total Principal Paid</span>
                <span className="text-lg font-bold text-emerald-400">₹{principalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Completion Date</span>
                <span className="text-sm font-semibold text-slate-200">{paidOffDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Non-Transferable ERC-721
              </span>
              <span className="font-mono text-emerald-500/80">Chain ID: 10143 (Monad)</span>
            </div>
          </div>

          {/* Mint Action Status */}
          {mintedTx ? (
            <div className="bg-emerald-900/30 border border-emerald-500/40 rounded-xl p-4 text-center space-y-2">
              <div className="inline-flex p-2 bg-emerald-500/20 text-emerald-400 rounded-full mb-1">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-emerald-300">Soulbound NFT Minted On-Chain!</h4>
              <p className="text-xs text-slate-400 font-mono break-all bg-slate-950 p-2 rounded border border-slate-800">
                Tx: {mintedTx}
              </p>
              <a
                href={`https://explorer.monad.xyz/tx/${mintedTx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 underline font-medium pt-1"
              >
                View on Monad Explorer <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleMintSoulboundNFT}
                disabled={isMinting}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isMinting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Minting on Monad Testnet...
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5" /> Mint Soulbound NFT Certificate
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-500">
                Soulbound tokens are permanently linked to your wallet address and cannot be transferred or sold.
              </p>
            </div>
          )}
        </div>

        {/* Footer close */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
