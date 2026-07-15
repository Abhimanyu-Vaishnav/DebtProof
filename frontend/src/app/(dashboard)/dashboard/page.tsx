/**
 * DebtProof — Main Dashboard Page
 * Shows real financial stats from the backend.
 */
import type { Metadata } from "next";
import { Topbar } from "@/components/layout/Topbar";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = { title: "Overview | DebtProof" };

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Overview" subtitle="Your financial snapshot" />
      <main className="page-content">
        <DashboardClient />
      </main>
    </>
  );
}
