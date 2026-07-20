import type { Metadata } from "next";
import { Topbar } from "@/components/layout/Topbar";
import { CreditCardsClient } from "@/components/credit-cards/CreditCardsClient";

export const metadata: Metadata = { title: "Credit Cards Tracker | DebtProof" };

export default function CreditCardsPage() {
  return (
    <>
      <Topbar title="Credit Cards" subtitle="Track credit limits, outstanding balances, utilization rates, and statement cycles" />
      <main className="page-content">
        <CreditCardsClient />
      </main>
    </>
  );
}
