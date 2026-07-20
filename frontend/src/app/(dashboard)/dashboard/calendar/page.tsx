import type { Metadata } from "next";
import { Topbar } from "@/components/layout/Topbar";
import { CalendarClient } from "@/components/calendar/CalendarClient";

export const metadata: Metadata = { title: "EMI Calendar | DebtProof" };

export default function CalendarPage() {
  return (
    <>
      <Topbar title="EMI Calendar" subtitle="Track upcoming, overdue, and paid EMIs by month" />
      <main className="page-content">
        <CalendarClient />
      </main>
    </>
  );
}
