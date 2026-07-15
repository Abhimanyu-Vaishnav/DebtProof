/**
 * DebtProof — Record Payment Page
 */
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { loansService } from "@/services/loans.service";
import type { Loan } from "@/types";

export default function RecordPaymentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loansService.getLoan(id)
      .then(setLoan)
      .catch(() => router.push(`/dashboard/loans/${id}`))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <LoadingSpinner fullPage label="Loading loan..." />;
  if (!loan) return null;

  return (
    <>
      <Topbar title="Record Payment" subtitle={`For: ${loan.name}`} />
      <main className="page-content max-w-2xl">
        <div className="card p-6">
          <PaymentForm loan={loan} />
        </div>
      </main>
    </>
  );
}
