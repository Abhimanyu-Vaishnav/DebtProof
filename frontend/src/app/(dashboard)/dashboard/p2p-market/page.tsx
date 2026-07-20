"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useWallet } from "@/hooks/useWallet";
import { loansService } from "@/services/loans.service";

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">P2P Lending Marketplace</h1>
          <p className="text-zinc-400 mt-1">Browse and fund decentralized escrow loans.</p>
        </div>
        {!walletAddress ? (
          <button 
            onClick={connectWallet}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
          >
            Connect Wallet to Fund
          </button>
        ) : (
          <div className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-emerald-400 font-medium">
            Wallet: {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-zinc-400">Loading marketplace...</div>
      ) : loans.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <h3 className="text-xl font-medium text-white mb-2">No Loan Requests</h3>
          <p className="text-zinc-400">There are currently no active escrow loan requests looking for funding.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map((loan) => (
            <div key={loan.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-emerald-500/30 transition-colors flex flex-col">
              <div className="p-5 border-b border-zinc-800">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-white">{loan.name}</h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
                    {loan.loan_type}
                  </span>
                </div>
                <div className="flex items-baseline space-x-1 mb-1">
                  <span className="text-2xl font-bold text-emerald-400">{loan.principal_amount} MON</span>
                </div>
                <p className="text-sm text-zinc-400">Looking for funding</p>
              </div>
              
              <div className="p-5 space-y-4 flex-grow">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500">Interest Rate</p>
                    <p className="font-medium text-zinc-200">{loan.interest_rate}% APR</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Duration</p>
                    <p className="font-medium text-zinc-200">
                      {new Date(loan.end_date).getFullYear() - new Date(loan.start_date).getFullYear()} Years
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-zinc-800/30 mt-auto">
                <button
                  onClick={() => handleFundLoan(loan)}
                  disabled={fundingId === loan.id}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg font-medium transition-colors flex justify-center items-center"
                >
                  {fundingId === loan.id ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
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
    </div>
  );
}
