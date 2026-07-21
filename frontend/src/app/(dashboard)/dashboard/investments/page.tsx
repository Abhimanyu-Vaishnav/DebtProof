import type { Metadata } from "next";
import { Topbar } from "@/components/layout/Topbar";
import { InvestmentsClient } from "@/components/investments/InvestmentsClient";

export const metadata: Metadata = {
  title: "Investments & Receivables | DebtProof",
  description: "Track all your mutual funds, SIPs, loans given, real estate property, and fixed assets.",
};

export default function InvestmentsPage() {
  return (
    <>
      <Topbar
        title="Investment Tracker"
        subtitle="Manage your SIPs, loans given to others, properties, and fixed assets"
      />
      <main className="page-content">
        <InvestmentsClient />
      </main>
    </>
  );
}
