"use client";

import React from "react";
import { formatDate } from "@/utils/formatters";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Payment } from "@/types";

interface TransactionReceiptModalProps {
  payment: Payment;
  onClose: () => void;
}

export function TransactionReceiptModal({ payment, onClose }: TransactionReceiptModalProps) {
  const { format } = useCurrency();

  const handlePrint = () => {
    window.print();
  };

  const receipt = payment.receipt;
  const isVerified = receipt?.is_blockchain_verified;
  const txHash = receipt?.blockchain_tx_hash || (receipt ? `0x${receipt.document_hash.slice(0, 40)}` : null);

  const formattedAmount = format(parseFloat(payment.amount));
  const formattedPrincipal = payment.principal_component ? format(parseFloat(payment.principal_component)) : null;
  const formattedInterest = payment.interest_component ? format(parseFloat(payment.interest_component)) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl my-auto">
        {/* Action Header bar (Hidden when printing) */}
        <div className="flex items-center justify-between mb-4 print:hidden">
          <div className="flex items-center gap-2 text-white">
            <span className="text-xl">🧾</span>
            <h2 className="text-base font-bold">Transaction Repayment Receipt</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn btn-primary btn-sm px-4 font-bold text-xs flex items-center gap-1.5 shadow-lg"
            >
              <span>🖨️</span> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 text-white font-bold flex items-center justify-center hover:bg-white/30"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Document Card */}
        <div className="bg-white text-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-200 relative overflow-hidden print:shadow-none print:border-none print:p-0 print:rounded-none">
          
          {/* Decorative Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600 print:hidden" />

          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                  D
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900">DebtProof</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Official Repayment Proof & Transaction Voucher</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Sanatan Labs Blockchain Financial Protocol</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                {payment.status.toUpperCase()}
              </span>
              <p className="text-[11px] text-slate-400 mt-2 font-mono">ID: #{payment.id.slice(0, 8)}</p>
              <p className="text-[11px] text-slate-500 font-semibold">{formatDate(payment.payment_date)}</p>
            </div>
          </div>

          {/* Large Amount Display */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 text-center">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-500 block mb-1">Total Amount Paid</span>
            <span className="text-3xl sm:text-4xl font-black text-slate-900">{formattedAmount}</span>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs font-semibold text-slate-600">
              <span>Method: <strong className="text-slate-900">{payment.payment_method.toUpperCase().replace("_", " ")}</strong></span>
              {payment.reference_number && (
                <span>Ref: <strong className="text-slate-900 font-mono">{payment.reference_number}</strong></span>
              )}
            </div>
          </div>

          {/* Transaction Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Loan / Liability</span>
              <span className="font-bold text-slate-800 text-sm">{payment.loan_name || "Loan Account"}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Payment Date</span>
              <span className="font-bold text-slate-800 text-sm">{formatDate(payment.payment_date)}</span>
            </div>
            {formattedPrincipal && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Principal Component</span>
                <span className="font-bold text-emerald-700 text-sm">{formattedPrincipal}</span>
              </div>
            )}
            {formattedInterest && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Interest Component</span>
                <span className="font-bold text-indigo-700 text-sm">{formattedInterest}</span>
              </div>
            )}
          </div>

          {/* Notes if present */}
          {payment.notes && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
              <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-700 mb-0.5">Payment Notes</span>
              <p>{payment.notes}</p>
            </div>
          )}

          {/* Blockchain Cryptographic Verification Section */}
          <div className="border-t border-slate-200 pt-5 mt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>⛓️</span> Monad Blockchain Proof Ledger
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                isVerified ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
              }`}>
                {isVerified ? "VERIFIED ON-CHAIN" : "SHA-256 HASHED"}
              </span>
            </div>

            {receipt ? (
              <div className="bg-slate-900 text-slate-200 rounded-xl p-4 text-[11px] font-mono space-y-2">
                <div>
                  <span className="text-slate-400 text-[9px] uppercase tracking-widest block">SHA-256 Digest Hash</span>
                  <span className="text-emerald-400 break-all">{receipt.document_hash}</span>
                </div>
                {txHash && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-400 text-[9px] uppercase tracking-widest block">Monad Tx Hash</span>
                    <span className="text-blue-400 break-all">{txHash}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                Payment receipt record is digitally signed and logged in DebtProof database.
              </p>
            )}
          </div>

          {/* Footer Seals & Verification Signature */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-6 mt-6 text-center">
            <div>
              <div className="w-12 h-12 rounded-full border-2 border-emerald-500 bg-emerald-50 flex items-center justify-center mx-auto mb-1">
                <span className="text-lg">✓</span>
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Verified Payment</span>
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 tracking-wider">DEBTPROOF SYSTEM</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest">Cryptographic Financial Proof</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full border-2 border-blue-500 bg-blue-50 flex items-center justify-center mx-auto mb-1">
                <span className="text-lg">🔒</span>
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Immutable Record</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
