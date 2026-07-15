/**
 * DebtProof — Add New Loan Page
 */
import type { Metadata } from "next";
import { Topbar } from "@/components/layout/Topbar";
import { LoanForm } from "@/components/loans/LoanForm";

export const metadata: Metadata = { title: "Add Loan | DebtProof" };

export default function NewLoanPage() {
  return (
    <>
      <Topbar title="Add New Loan" subtitle="Track a new loan and start generating proof" />
      <main className="page-content max-w-3xl">
        <div className="card p-6">
          <LoanForm />
        </div>
      </main>
    </>
  );
}
