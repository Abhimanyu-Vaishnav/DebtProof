"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { loansService } from "@/services/loans.service";
import apiClient from "@/services/api";
import { Topbar } from "@/components/layout/Topbar";
import { formatCurrency, formatDate } from "@/utils/formatters";

export default function P2PMarketplacePage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fundingId, setFundingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [p2pName, setP2pName] = useState("");
  const [counterpartyName, setCounterpartyName] = useState("");
  const [counterpartyEmail, setCounterpartyEmail] = useState("");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [interestRate, setInterestRate] = useState("8.50");
  const [monthlyEmi, setMonthlyEmi] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [submitting, setSubmitting] = useState(false);

  const { walletAddress, connectWallet, fundEscrowLoan } = useWallet();

  useEffect(() => {
    fetchMarketplace();
  }, []);

  const fetchMarketplace = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/loans/marketplace/");
      setLoans(res.data.results || []);
    } catch (err) {
      console.error("Failed to fetch marketplace loans", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFundLoan = async (loan: any) => {
    if (!walletAddress) {
      await connectWallet();
      return;
    }

    try {
      setFundingId(loan.id);
      const txHash = await fundEscrowLoan(loan.id, loan.principal_amount.toString());
      await loansService.updateLoan(loan.id, {
        lender_wallet: walletAddress,
        lender_name: "Web3 Lender",
      });
      alert(`Successfully funded loan! TX: ${txHash}`);
      fetchMarketplace();
    } catch (err: any) {
      alert(`Error funding loan: ${err.message}`);
    } finally {
      setFundingId(null);
    }
  };

  const handleCreateP2P = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await loansService.createLoan({
        name: p2pName || `P2P Debt (${counterpartyName})`,
        loan_type: "personal",
        lender_name: counterpartyName || "Peer Lender",
        principal_amount: principalAmount,
        interest_rate: interestRate,
        monthly_emi: monthlyEmi || (parseFloat(principalAmount) / 12).toFixed(2),
        start_date: startDate,
        end_date: endDate,
        is_p2p_agreement: true,
        counterparty_name: counterpartyName,
        counterparty_email: counterpartyEmail,
        contract_status: "active",
      });
      alert("P2P Promissory Agreement created successfully!");
      setShowCreateModal(false);
      fetchMarketplace();
    } catch (err: any) {
      alert(`Failed to create P2P agreement: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Topbar title="P2P Market" subtitle="Peer-to-peer lending contracts and Web3 escrow marketplace" />
      <main className="page-content space-y-6">
        
        {/* Mobile Responsive Header Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[var(--color-surface-secondary)] p-4 sm:p-5 rounded-2xl border border-[var(--color-border-light)] gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
              P2P Promissory Notes & Escrow
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-tertiary)] mt-0.5">
              Create formal peer contracts with friends or fund decentralized Monad escrow loans.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-sm px-4 py-2 font-bold text-xs flex-1 sm:flex-none justify-center"
            >
              + Create P2P Agreement
            </button>
            {!walletAddress ? (
              <button onClick={connectWallet} className="btn btn-secondary btn-sm px-4 py-2 text-xs font-semibold shrink-0">
                Connect Wallet
              </button>
            ) : (
              <div className="px-3 py-1.5 bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] rounded-xl text-[var(--color-accent)] font-mono text-xs font-semibold shrink-0">
                {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
              </div>
            )}
          </div>
        </div>

        {/* Marketplace Listings Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
            Active Escrow Loans
          </h3>
          <span className="text-xs text-[var(--color-text-tertiary)]">{loans.length} requests available</span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-sm text-[var(--color-text-tertiary)]">Loading marketplace...</div>
        ) : loans.length === 0 ? (
          <div className="card text-center py-16 p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[var(--color-surface-tertiary)] flex items-center justify-center text-2xl mx-auto">
              🤝
            </div>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">No Active Loan Requests</h3>
            <p className="text-xs text-[var(--color-text-tertiary)] max-w-sm mx-auto">
              There are currently no active open escrow requests looking for Web3 lenders. Click "+ Create P2P Agreement" to log a peer contract!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {loans.map((loan) => (
              <div key={loan.id} className="card p-5 flex flex-col hover:border-[var(--color-accent)] transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-bold text-[var(--color-text-primary)]">{loan.name}</h3>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{loan.lender_name || "Borrower"}</p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    Low Risk 🟢
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[var(--color-surface-secondary)] mb-4 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-text-tertiary)] block">Required Funding</span>
                  <span className="text-xl font-black text-[var(--color-accent)]">{formatCurrency(parseFloat(loan.principal_amount))}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold block">Interest Rate</span>
                    <span className="font-bold text-[var(--color-text-primary)]">{loan.interest_rate}% APR</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold block">Tenure</span>
                    <span className="font-bold text-[var(--color-text-primary)]">
                      {formatDate(loan.start_date)} - {formatDate(loan.end_date)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleFundLoan(loan)}
                  disabled={fundingId === loan.id}
                  className="w-full btn btn-primary btn-sm py-2 font-bold mt-auto"
                >
                  {fundingId === loan.id ? "Funding via Web3..." : "Fund Loan Request"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create P2P Agreement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="card w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border-light)] p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-3">
              <h3 className="font-bold text-base text-[var(--color-text-primary)]">New P2P Promissory Agreement</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-xs font-bold text-[var(--color-text-tertiary)] hover:underline">
                Close ✕
              </button>
            </div>

            <form onSubmit={handleCreateP2P} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">Debt / Agreement Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Personal Loan to Rohan"
                  className="input w-full text-xs h-10"
                  value={p2pName}
                  onChange={(e) => setP2pName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">Counterparty Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Friend / Relative Name"
                    className="input w-full text-xs h-10"
                    value={counterpartyName}
                    onChange={(e) => setCounterpartyName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">Counterparty Email</label>
                  <input
                    type="email"
                    placeholder="rohan@example.com"
                    className="input w-full text-xs h-10"
                    value={counterpartyEmail}
                    onChange={(e) => setCounterpartyEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">Principal Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="50000"
                    className="input w-full text-xs h-10"
                    value={principalAmount}
                    onChange={(e) => setPrincipalAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">Annual Interest (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="8.50"
                    className="input w-full text-xs h-10"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">Start Date</label>
                  <input
                    type="date"
                    required
                    className="input w-full text-xs h-10"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider text-[10px]">End Date</label>
                  <input
                    type="date"
                    required
                    className="input w-full text-xs h-10"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-sm w-full py-2.5 font-bold text-xs mt-2"
              >
                {submitting ? "Generating Contract..." : "Create & Sign Promissory Agreement"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
