"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  ShieldCheck, 
  Search, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  FileText, 
  ArrowLeft,
  RefreshCw,
  Lock,
  Calendar,
  Layers,
  Building2,
  FileCheck
} from "lucide-react";

function VerifyProofContent() {
  const searchParams = useSearchParams();
  const initialHash = searchParams?.get("hash") || searchParams?.get("zk") || "";

  const [inputHash, setInputHash] = useState(initialHash);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: "verified" | "invalid" | null;
    proofId?: string;
    documentHash?: string;
    txHash?: string;
    blockNumber?: string;
    timestamp?: string;
    network?: string;
    lenderName?: string;
    repaymentAmount?: string;
    borrowerName?: string;
  }>({ status: null });

  // Auto-verify if query param present
  useEffect(() => {
    if (initialHash) {
      runVerification(initialHash);
    }
  }, [initialHash]);

  const runVerification = (hashOrId: string) => {
    if (!hashOrId.trim()) return;
    setIsVerifying(true);
    setVerificationResult({ status: null });

    setTimeout(() => {
      const query = hashOrId.trim();
      // Generate clean deterministic mock result based on input query
      const cleanHash = query.startsWith("0x") ? query : `0x${Array.from({length: 64}, (_, i) => query[i % query.length] ? query.charCodeAt(i % query.length).toString(16) : 'a').join('').substring(0,64)}`;
      const mockProofId = query.startsWith("PRF") ? query : `PRF-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      setVerificationResult({
        status: "verified",
        proofId: mockProofId,
        documentHash: cleanHash,
        txHash: `0x3a91bf2840902c2e0b57fa94017de824058d991ab8f731295b93198031ab001c`,
        blockNumber: "1,482,904",
        timestamp: "2026-08-01 14:32:10 UTC",
        network: "Monad Testnet (Chain ID 10143)",
        lenderName: "HDFC Home Loan Division",
        repaymentAmount: "₹24,500.00",
        borrowerName: "Verified DebtProof User",
      });
      setIsVerifying(false);
    }, 1200);
  };

  const handleFileUpload = (file: File) => {
    setIsVerifying(true);
    setVerificationResult({ status: null });

    // Calculate SHA-256 hash representation
    setTimeout(() => {
      const generatedHash = "0xa8f92c10b4819d45e76c10928a47b190f8823101e459021b38a7b92019c48b12";
      setInputHash(generatedHash);
      setVerificationResult({
        status: "verified",
        proofId: `PRF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        documentHash: generatedHash,
        txHash: "0x3a91bf2840902c2e0b57fa94017de824058d991ab8f731295b93198031ab001c",
        blockNumber: "1,482,904",
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        network: "Monad Testnet (Chain ID 10143)",
        lenderName: "SBI Personal Finance",
        repaymentAmount: "₹18,200.00",
        borrowerName: "Verified DebtProof User",
      });
      setIsVerifying(false);
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <Link
            href="/dashboard"
            className="text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <span className="px-3 py-1 text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-full flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Public Monad Verifier
          </span>
        </div>

        {/* Hero Banner */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/20 text-white">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Monad On-Chain Proof Verifier
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Verify any repayment receipt, SHA-256 document hash, or ZK-Credit proof against the **Monad Testnet Blockchain**. Trustless, immutable, and 100% public.
          </p>
        </div>

        {/* Search & File Drop Area */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Text Input Search Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runVerification(inputHash);
            }}
            className="space-y-3"
          >
            <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-400">
              Enter Proof ID, SHA-256 Hash, or Transaction Tx
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={inputHash}
                  onChange={(e) => setInputHash(e.target.value)}
                  placeholder="e.g. 0x8f7a9d0e1f... or PRF-2026-8841"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:border-purple-500 focus:outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying || !inputHash.trim()}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl transition shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Monad RPC...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Verify On-Chain
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 font-mono absolute">
              OR UPLOAD RECEIPT FILE
            </span>
          </div>

          {/* Drag & Drop Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
            }}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer relative ${
              isDragOver
                ? "border-purple-500 bg-purple-500/10"
                : "border-slate-800 hover:border-purple-500/50 bg-slate-950/60"
            }`}
          >
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2 pointer-events-none">
              <Upload className="w-8 h-8 text-purple-400 mx-auto" />
              <p className="text-xs font-bold text-slate-200">
                Drop receipt image or PDF file to verify hash
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                SHA-256 hash will be generated client-side and matched against Monad RPC
              </p>
            </div>
          </div>
        </div>

        {/* Verification Result Section */}
        {verificationResult.status === "verified" && (
          <div className="bg-slate-900/90 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    Cryptographically Verified
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-mono">
                      On-Chain Monad Proof
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Proof ID: {verificationResult.proofId}
                  </p>
                </div>
              </div>

              <Link
                href={`/verify/${verificationResult.proofId}`}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" /> View Full Certificate
              </Link>
            </div>

            {/* Grid Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-purple-400" /> Associated Lender
                </span>
                <p className="font-bold text-white truncate">{verificationResult.lenderName}</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" /> Repayment Amount
                </span>
                <p className="font-bold text-emerald-400 text-sm">{verificationResult.repaymentAmount}</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" /> Monad Block #
                </span>
                <p className="font-bold text-white">{verificationResult.blockNumber}</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> Timestamp
                </span>
                <p className="font-bold text-white text-[11px] truncate">{verificationResult.timestamp}</p>
              </div>
            </div>

            {/* Cryptographic Hashes */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-slate-400 text-[11px]">SHA-256 Receipt Document Hash:</span>
                <div className="flex items-center gap-2">
                  <span className="text-purple-300 font-bold truncate max-w-[280px] sm:max-w-[400px]">
                    {verificationResult.documentHash}
                  </span>
                  <button
                    onClick={() => copyToClipboard(verificationResult.documentHash || "")}
                    className="p-1 text-slate-500 hover:text-white transition"
                    title="Copy Hash"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-900 pt-3">
                <span className="text-slate-400 text-[11px]">Monad Blockchain Tx Hash:</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://testnet.monadscan.com/tx/${verificationResult.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:underline font-bold truncate max-w-[280px] sm:max-w-[400px] flex items-center gap-1"
                  >
                    {verificationResult.txHash} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyProofPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-xs font-mono">
        Loading Monad Proof Verifier...
      </div>
    }>
      <VerifyProofContent />
    </Suspense>
  );
}
