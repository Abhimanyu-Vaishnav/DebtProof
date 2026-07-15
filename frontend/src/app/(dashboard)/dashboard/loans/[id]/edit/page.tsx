/**
 * DebtProof — Edit Loan Page
 */
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { LoanForm } from "@/components/loans/LoanForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { loansService } from "@/services/loans.service";
import type { Loan } from "@/types";

export default function EditLoanPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loansService.getLoan(id)
      .then(setLoan)
      .catch(() => router.push("/dashboard/loans"))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <LoadingSpinner fullPage label="Loading loan..." />;
  if (!loan) return null;

  return (
    <>
      <Topbar title={`Edit: ${loan.name}`} subtitle="Update loan details" />
      <main className="page-content max-w-3xl">
        <div className="card p-6">
          <LoanForm initialData={loan} isEdit />
        </div>
      </main>
    </>
  );
}
