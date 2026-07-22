import type { Metadata } from "next";
import { Topbar } from "@/components/layout/Topbar";
import { BudgetClient } from "@/components/budget/BudgetClient";

export const metadata: Metadata = {
  title: "Budget Planner | DebtProof",
  description: "Plan your monthly budget — track income, expenses, EMI commitments, and savings rate in one place.",
};

export default function BudgetPage() {
  return (
    <>
      <Topbar
        title="Budget Planner"
        subtitle="Monthly income · expenses · EMI · savings — all in one view"
      />
      <main className="page-content">
        <BudgetClient />
      </main>
    </>
  );
}
