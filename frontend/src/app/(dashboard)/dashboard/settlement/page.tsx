"use client";

import React from "react";
import { Topbar } from "@/components/layout/Topbar";
import { AIDebtSettlementStudio } from "@/components/settlement/AIDebtSettlementStudio";

export default function SettlementPage() {
  return (
    <>
      <Topbar
        title="AI Debt Settlement Studio"
        subtitle="Lump-sum payoff discount modeling & bank negotiation proposal generator"
      />

      <main className="page-content space-y-6 pb-12">
        <AIDebtSettlementStudio />
      </main>
    </>
  );
}
