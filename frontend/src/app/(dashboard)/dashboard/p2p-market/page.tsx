"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { loansService } from "@/services/loans.service";
import apiClient from "@/services/api";
import { Topbar } from "@/components/layout/Topbar";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { P2PContractModal } from "@/components/loans/P2PContractModal";
import type { Loan } from "@/types";

export default function P2PMarketplacePage() {
  const [activeTab, setActiveTab] = useState<"my_agreements" | "marketplace">("my_agreements");
  const [myP2pLoans, setMyP2pLoans] = useState<Loan[]>([]);
  const [marketLoans, setMarketLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fundingId, setFundingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContractLoan, setSelectedContractLoan] = useState<Loan | null>(null);

  // Form State
  const [p2pName, setP2pName] = useState("");
  const [counterpartyName, setCounterpartyName] = useState("");
  const [counterpartyEmail, setCounterpartyEmail] = useState("");
  const [counterpartyPhone, setCounterpartyPhone] = useState("");
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
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [userLoansRes, marketRes] = await Promise.all([
        loansService.getLoans({ page_size: 100 }),
        apiClient.get("/loans/marketplace/").catch(() => ({ data: { results: [] } })),
      ]);
      const p2pList = (userLoansRes.results || []).filter(
        (l) => l.is_p2p_agreement || l.counterparty_name || l.loan_type === "personal"
      );
      setMyP2pLoans(p2pList);
      setMarketLoans(marketRes.data?.results || []);
    } catch (err) {
      console.error("Failed to load P2P data", err);
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
      fetchData();
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
      const createdLoan = await loansService.createLoan({
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
        counterparty_phone: counterpartyPhone,
        contract_status: "active",
      });
      alert("P2P Promissory Agreement created successfully!");
      setShowCreateModal(false);
      setP2pName("");
      setCounterpartyName("");
      setCounterpartyEmail("");
      setCounterpartyPhone("");
      setPrincipalAmount("");
      fetchData();
      setSelectedContractLoan(createdLoan);
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
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[var(--color-surface-secondary)] p-4 sm:p-5 rounded-2xl border border-[var(--color-border-light)] gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
              P2P Promissory Notes & Escrow
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-tertiary)] mt-0.5">
              Create formal legal promissory agreements for personal debts or fund Web3 escrow loans.
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

        {/* Tab Toggle Navigation */}
        <div className="flex border-b border-[var(--color-border-light)] space-x-6">
          <button
            onClick={() => setActiveTab("my_agreements")}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === "my_agreements"
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            My P2P Agreements ({myP2pLoans.length})
          </button>
          <button
            onClick={() => setActiveTab("marketplace")}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === "marketplace"
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            Web3 Escrow Marketplace ({marketLoans.length})
          </button>
        </div>

        {/* Tab 1: My P2P Agreements */}
        {activeTab === "my_agreements" && (
          <div>
            {isLoading ? (
              <div className="text-center py-12 text-xs text-[var(--color-text-tertiary)]">Loading P2P agreements...</div>
            ) : myP2pLoans.length === 0 ? (
              <div className="card text-center py-16 p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[var(--color-surface-tertiary)] flex items-center justify-center text-2xl mx-auto">
                  📜
                </div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">No P2P Agreements Found</h3>
                <p className="text-xs text-[var(--color-text-tertiary)] max-w-sm mx-auto">
                  You haven't logged any personal peer-to-peer debts yet. Click "+ Create P2P Agreement" above to generate a formal digital contract!
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary btn-sm px-4 py-2 font-bold text-xs mx-auto"
                >
                  + Create Your First P2P Agreement
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {myP2pLoans.map((loan) => (
                  <div key={loan.id} className="card p-5 flex flex-col justify-between space-y-4 hover:border-[var(--color-primary-light)] transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-base font-bold text-[var(--color-text-primary)]">{loan.name}</h3>
                          <p className="text-xs text-[var(--color-text-tertiary)]">
                            Counterparty: <strong className="text-[var(--color-text-secondary)]">{loan.counterparty_name || loan.lender_name}</strong>
                          </p>
                        </div>
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                          {loan.contract_status || "Active Contract"}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--color-surface-secondary)] space-y-1 mb-3">
                        <span className="text-[10px] uppercase font-bold text-[var(--color-text-tertiary)] block">Principal Debt</span>
                        <span className="text-xl font-black text-[var(--color-text-primary)]">{formatCurrency(parseFloat(loan.principal_amount))}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold block">Outstanding</span>
                          <span className="font-bold text-[var(--color-error)]">{formatCurrency(parseFloat(loan.outstanding_amount))}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold block">Monthly EMI</span>
                          <span className="font-bold text-[var(--color-accent)]">{formatCurrency(parseFloat(loan.monthly_emi))}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[var(--color-border-light)] flex justify-between items-center">
                      <span className="text-[10px] text-[var(--color-text-tertiary)]">
                        Due: {formatDate(loan.end_date)}
                      </span>
                      <button
                        onClick={() => setSelectedContractLoan(loan)}
                        className="btn btn-secondary btn-xs px-3 text-xs font-bold flex items-center gap-1"
                      >
                        📜 View Contract
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Web3 Escrow Marketplace */}
        {activeTab === "marketplace" && (
          <div>
            {isLoading ? (
              <div className="text-center py-12 text-sm text-[var(--color-text-tertiary)]">Loading marketplace...</div>
            ) : marketLoans.length === 0 ? (
              <div className="card text-center py-16 p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[var(--color-surface-tertiary)] flex items-center justify-center text-2xl mx-auto">
                  🤝
                </div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">No Active Loan Requests</h3>
                <p className="text-xs text-[var(--color-text-tertiary)] max-w-sm mx-auto">
                  There are currently no active open escrow requests looking for Web3 lenders.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {marketLoans.map((loan) => (
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

      {/* Contract Viewer Modal */}
      {selectedContractLoan && (
        <P2PContractModal loan={selectedContractLoan} onClose={() => setSelectedContractLoan(null)} />
      )}
    </>
  );
}
