"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { loansService } from "@/services/loans.service";
import { Topbar } from "@/components/layout/Topbar";

export default function P2PMarketplacePage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fundingId, setFundingId] = useState<string | null>(null);
  const { walletAddress, connectWallet, fundEscrowLoan } = useWallet();

  useEffect(() => {
    fetchMarketplace();
  }, []);

  const fetchMarketplace = async () => {
    try {
      setIsLoading(true);
      // Custom endpoint for marketplace we added in Django
      const res = await loansService.api.get("/loans/marketplace/");
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
      
      // Step 1: Fund on blockchain
      const txHash = await fundEscrowLoan(loan.id, loan.principal_amount.toString());
      
      // Step 2: Update backend
      await loansService.update(loan.id, {
        lender_wallet: walletAddress,
        lender_name: "Web3 Lender" // Generic name for anonymous lender
      });
      
      alert(`Successfully funded loan! TX: ${txHash}`);
      fetchMarketplace(); // Refresh list
    } catch (err: any) {
      alert(`Error funding loan: ${err.message}`);
    } finally {
      setFundingId(null);
    }
  };

  return (
    <>
      <Topbar title="P2P Market" subtitle="Browse and fund decentralized escrow loans" />
      <main className="page-content space-y-6">
        <div className="flex justify-between items-center bg-[var(--color-surface-secondary)] p-5 rounded-[var(--radius-lg)] border border-[var(--color-border-light)]">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">P2P Lending Marketplace</h1>
            <p className="text-sm text-[var(--color-text-tertiary)] mt-1">Connect your Web3 wallet to fund decentralized escrow loans.</p>
          </div>
          {!walletAddress ? (
            <button 
              onClick={connectWallet}
              className="btn btn-primary"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="px-4 py-2 bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-accent)] font-medium text-sm">
              Wallet: {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
            </div>
          )}
        </div>

        {isLoading ? (
        <div className="text-center py-12 text-[var(--color-text-tertiary)]">Loading marketplace...</div>
      ) : loans.length === 0 ? (
        <div className="card text-center py-20">
          <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-2">No Loan Requests</h3>
          <p className="text-[var(--color-text-tertiary)]">There are currently no active escrow loan requests looking for funding.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map((loan) => (
            <div key={loan.id} className="card flex flex-col hover:border-[var(--color-accent)] transition-colors">
              <div className="p-5 border-b border-[var(--color-border-light)]">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-[var(--color-text-primary)]">{loan.name}</h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border)] capitalize">
                    {loan.loan_type}
                  </span>
                </div>
                <div className="flex items-baseline space-x-1 mb-1">
                  <span className="text-2xl font-bold text-[var(--color-accent)]">{loan.principal_amount} MON</span>
                </div>
                <p className="text-sm text-[var(--color-text-tertiary)]">Looking for funding</p>
              </div>
              
              <div className="p-5 space-y-4 flex-grow">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[var(--color-text-tertiary)] text-xs uppercase tracking-wider mb-1">Interest Rate</p>
                    <p className="font-medium text-[var(--color-text-primary)]">{loan.interest_rate}% APR</p>
                  </div>
                  <div>
                    <p className="text-[var(--color-text-tertiary)] text-xs uppercase tracking-wider mb-1">Duration</p>
                    <p className="font-medium text-[var(--color-text-primary)]">
                      {new Date(loan.end_date).getFullYear() - new Date(loan.start_date).getFullYear()} Years
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-[var(--color-surface-secondary)] border-t border-[var(--color-border-light)] mt-auto rounded-b-[var(--radius-lg)]">
                <button
                  onClick={() => handleFundLoan(loan)}
                  disabled={fundingId === loan.id}
                  className="w-full btn btn-primary flex justify-center items-center"
                >
                  {fundingId === loan.id ? (
                    <span className="flex items-center">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Funding via Web3...
                    </span>
                  ) : (
                    "Fund Loan Request"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </main>
    </>
  );
}
