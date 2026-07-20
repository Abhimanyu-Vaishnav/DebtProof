import type { Metadata } from "next";
import { Topbar } from "@/components/layout/Topbar";
import { ReportsClient } from "@/components/reports/ReportsClient";

export const metadata: Metadata = { title: "Reports & Exports | DebtProof" };

export default function ReportsPage() {
  return (
    <>
      <Topbar title="Reports & Export" subtitle="Download structured CSV/JSON logs of your debts and payment history" />
      <main className="page-content">
        <ReportsClient />
      </main>
    </>
  );
}
