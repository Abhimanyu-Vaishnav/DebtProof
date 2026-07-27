import type { Metadata } from "next";
import { Topbar } from "@/components/layout/Topbar";
import { ReportsClient } from "@/components/reports/ReportsClient";
import { CustomCSVExcelExportEngine } from "@/components/reports/CustomCSVExcelExportEngine";

export const metadata: Metadata = { title: "Reports & Exports | DebtProof" };

export default function ReportsPage() {
  return (
    <>
      <Topbar title="Reports & Export" subtitle="Download structured CSV/JSON logs of your debts and payment history" />
      <main className="page-content space-y-6">
        <CustomCSVExcelExportEngine />
        <ReportsClient />
      </main>
    </>
  );
}
