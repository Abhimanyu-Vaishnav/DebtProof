import type { Metadata } from "next";
import { Topbar } from "@/components/layout/Topbar";
import { NetWorthClient } from "@/components/net-worth/NetWorthClient";
import { Web3StakingYieldStrategyStudio } from "@/components/net-worth/Web3StakingYieldStrategyStudio";

export const metadata: Metadata = { title: "Net Worth Tracker | DebtProof" };

export default function NetWorthPage() {
  return (
    <>
      <Topbar title="Net Worth" subtitle="Track your assets, liabilities, and actual net worth" />
      <main className="page-content space-y-6">
        <Web3StakingYieldStrategyStudio />
        <NetWorthClient />
      </main>
    </>
  );
}
