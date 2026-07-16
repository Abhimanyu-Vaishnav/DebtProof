/**
 * DebtProof — Proof Verification Page
 * Dedicated page to verify repayment receipt authenticity against Monad on-chain proofs.
 */
"use client";

import React, { useState, useRef } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { paymentsService } from "@/services/payments.service";
import { useToast } from "@/components/ui/Toast";

interface VerificationResult {
  verified: boolean;
  document_hash: string;
  proof_id?: string;
  tx_hash?: string;
  anchored_at?: string;
  wallet_address?: string;
  network?: string;
  block_number?: number;
  message?: string;
}

export default function VerifyProofPage() {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [localHash, setLocalHash] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateSHA256 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result) {
          reject(new Error("Failed to read file"));
          return;
        }
        const buffer = e.target.result as ArrayBuffer;
        
        try {
          // Use Web Cryptography API to calculate SHA-256 in browser
          const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          resolve(hashHex);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("File read error"));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = async (selectedFile: File) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(selectedFile.type)) {
      showToast("Unsupported file type. Only PDF, JPG, and PNG are allowed.", "error");
      return;
    }
    
    setFile(selectedFile);
    setResult(null);
    setLocalHash(null);
    
    try {
      const hash = await calculateSHA256(selectedFile);
      setLocalHash(hash);
    } catch (err) {
      showToast("Failed to compute SHA-256 hash locally.", "error");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleVerify = async () => {
    if (!file) return;
    setIsVerifying(true);
    
    try {
      const response = await paymentsService.verifyProof(file);
      setResult(response);
      
      if (response.verified) {
        showToast("Proof verification successful! Receipt matches the onchain registry.", "success");
      } else {
        showToast("No matching proof found. Verification failed.", "error");
      }
    } catch (err) {
      showToast("An error occurred during verification.", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setLocalHash(null);
  };

  return (
    <>
      <Topbar 
        title="Proof Verification Portal" 
        subtitle="Verify the absolute integrity and ownership of any loan repayment receipt using tamper-proof blockchain metadata." 
      />
      <main className="page-content max-w-4xl mx-auto space-y-6">
        
        {/* Upload Container */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-4">
            Verify Receipt Document
          </h2>
          
          {!file ? (
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragActive 
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)] bg-opacity-5" 
                  : "border-[var(--color-border-light)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-secondary)]"
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />
              <div className="w-12 h-12 rounded-full bg-[var(--color-accent)] bg-opacity-10 flex items-center justify-center text-[var(--color-accent)] mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">
                Drag and drop your receipt file here
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                Supports PDF, JPEG, and PNG (Max 5MB)
              </p>
              <button type="button" className="btn btn-secondary btn-sm mt-4">
                Browse Files
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface-secondary)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)] bg-opacity-10 flex items-center justify-center text-[var(--color-accent)] shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)]">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button 
                  onClick={resetForm} 
                  className="btn btn-ghost btn-sm text-[var(--color-error)] text-xs"
                >
                  Remove
                </button>
              </div>

              {localHash && (
                <div className="p-3 rounded-lg bg-[var(--color-surface-tertiary)] border border-[var(--color-border-light)] font-mono text-[10px] text-[var(--color-text-secondary)] break-all">
                  <span className="font-semibold text-[var(--color-text-tertiary)]">Calculated SHA-256: </span>
                  {localHash}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button onClick={resetForm} className="btn btn-secondary">
                  Clear
                </button>
                <button 
                  onClick={handleVerify} 
                  disabled={isVerifying}
                  className="btn btn-accent flex items-center gap-1.5"
                >
                  {isVerifying ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      <span>Verify Authenticity</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Verification Result Screens */}
        {result && (
          <div className={`card overflow-hidden border animation-fade-in ${
            result.verified 
              ? "border-emerald-500/30 bg-emerald-500/5" 
              : "border-rose-500/30 bg-rose-500/5"
          }`}>
            
            {/* Header Banner */}
            <div className={`p-4 flex items-center gap-3 border-b ${
              result.verified ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-rose-500/20 bg-rose-500/10 text-rose-400"
            }`}>
              {result.verified ? (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
                  </svg>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider">VERIFIED AUTHENTIC</h3>
                    <p className="text-xs opacity-80 font-medium">This document is identical to the verified receipt anchored on-chain.</p>
                  </div>
                </>
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider">NOT VERIFIED</h3>
                    <p className="text-xs opacity-80 font-medium">No matching blockchain proof found for this receipt.</p>
                  </div>
                </>
              )}
            </div>

            {/* Verification Metadata */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                <div className="md:col-span-2 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Receipt Hash (SHA-256)</span>
                  <p className="font-mono text-[var(--color-text-secondary)] select-all break-all bg-[var(--color-surface-secondary)] p-2.5 rounded-lg border border-[var(--color-border-light)]">
                    {result.document_hash}
                  </p>
                </div>

                {result.verified && (
                  <>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Proof ID (UUID)</span>
                      <p className="font-mono text-[var(--color-text-primary)] font-semibold select-all truncate bg-[var(--color-surface-secondary)] p-2.5 rounded-lg border border-[var(--color-border-light)]">
                        {result.proof_id}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Target Network</span>
                      <p className="text-[var(--color-text-primary)] font-semibold bg-[var(--color-surface-secondary)] p-2.5 rounded-lg border border-[var(--color-border-light)]">
                        {result.network || "Monad Testnet"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Registered Wallet</span>
                      <p className="font-mono text-[var(--color-text-primary)] font-semibold select-all truncate bg-[var(--color-surface-secondary)] p-2.5 rounded-lg border border-[var(--color-border-light)]">
                        {result.wallet_address}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Blockchain Anchoring Block</span>
                      <p className="font-mono text-[var(--color-text-primary)] font-semibold bg-[var(--color-surface-secondary)] p-2.5 rounded-lg border border-[var(--color-border-light)]">
                        #{result.block_number || "Pending"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Anchoring Date</span>
                      <p className="text-[var(--color-text-primary)] font-semibold bg-[var(--color-surface-secondary)] p-2.5 rounded-lg border border-[var(--color-border-light)]">
                        {result.anchored_at ? new Date(result.anchored_at).toLocaleString() : "N/A"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Transaction Hash</span>
                      <div className="flex items-center gap-1 bg-[var(--color-surface-secondary)] p-2.5 rounded-lg border border-[var(--color-border-light)]">
                        <p className="font-mono text-[var(--color-text-primary)] font-semibold select-all truncate min-w-0 flex-1">
                          {result.tx_hash}
                        </p>
                        <a
                          href={`https://testnet.monadsv.com/tx/${result.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--color-accent)] hover:underline inline-flex items-center gap-0.5 shrink-0"
                          title="View Transaction on Monad Explorer"
                        >
                          <span className="text-xs">Explorer</span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {!result.verified && (
                <div className="p-4 rounded-xl border border-rose-500/10 bg-rose-500/5 text-rose-300 text-xs leading-relaxed space-y-2">
                  <p className="font-semibold text-rose-200">Why did this happen?</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>This receipt might not have been recorded on DebtProof or its proof was never anchored on the Monad network.</li>
                    <li>The receipt document may have been edited, corrupted, or tampered with (even minor edits change the SHA-256 hash completely).</li>
                    <li>Ensure you are uploading the original PDF/image file that was used during payment submission.</li>
                  </ul>
                </div>
              )}

            </div>
          </div>
        )}
      </main>
    </>
  );
}
