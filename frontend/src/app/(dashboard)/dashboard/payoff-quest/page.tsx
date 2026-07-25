"use client";

import React from "react";
import { Topbar } from "@/components/layout/Topbar";
import { DebtDestroyerStudio } from "@/components/quest/DebtDestroyerStudio";

export default function PayoffQuestPage() {
  return (
    <>
      <Topbar
        title="Debt Destroyer Quest & Badges"
        subtitle="Gamified payoff velocity roadmap & Monad Soulbound Badge (SBT) engine"
      />

      <main className="page-content space-y-6 pb-12">
        <DebtDestroyerStudio />
      </main>
    </>
  );
}
