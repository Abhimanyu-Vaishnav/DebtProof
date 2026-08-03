/**
 * DebtProof — Modern Interactive Loan Creation & Amortization Studio
 */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { loansService } from "@/services/loans.service";
import { useWallet } from "@/hooks/useWallet";
import { useSubscription } from "@/context/SubscriptionContext";
import { formatCurrency } from "@/utils/formatters";
import { 
  Calculator, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileText, 
  Info, 
  Lock, 
  Percent, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  ArrowRight,
  Check,
  X,
  Sliders,
  ChevronRight
} from "lucide-react";
import type { Loan, LoanFormData } from "@/types";

interface LoanFormProps {
  initialData?: Loan;
  isEdit?: boolean;
}

const LOAN_TYPE_OPTIONS = [
  { value: "home", label: "🏠 Home Loan" },
  { value: "personal", label: "👤 Personal Loan" },
  { value: "vehicle", label: "🚗 Vehicle Loan" },
  { value: "education", label: "🎓 Education Loan" },
  { value: "business", label: "💼 Business Loan" },
  { value: "credit_card", label: "💳 Credit Card" },
  { value: "other", label: "📄 Other" },
];

interface EmiScheduleRow {
  monthIndex: number; // 1 to totalMonths
  dueDate: string; // YYYY-MM-DD
  formattedDate: string;
  emiAmount: number;
  principalComponent: number;
  interestComponent: number;
  remainingBalance: number;
  isPast: boolean;
  isPaid: boolean;
}

export function LoanForm({ initialData, isEdit = false }: LoanFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { walletAddress, connectWallet, createEscrowLoan } = useWallet();
  const { canCreateLoan, openPaywall, currentPlan, usageStats } = useSubscription();
  const [loading, setLoading] = useState(false);

  const quotaCheck = canCreateLoan();

  // Primary Inputs
  const [name, setName] = useState(initialData?.name ?? "");
  const [loanType, setLoanType] = useState(initialData?.loan_type ?? "personal");
  const [lenderName, setLenderName] = useState(initialData?.lender_name ?? "");
  const [accountNumber, setAccountNumber] = useState(initialData?.account_number ?? "");
  const [isEscrow, setIsEscrow] = useState(initialData?.is_escrow ?? false);
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  // Financial & Duration Inputs
  const [principalAmount, setPrincipalAmount] = useState<string>(initialData?.principal_amount ?? "500000");
  const [interestRate, setInterestRate] = useState<string>(initialData?.interest_rate ?? "10.5");
  const [durationMonths, setDurationMonths] = useState<number>(36);
  const [processingFee, setProcessingFee] = useState<string>("2500");
  const [startDate, setStartDate] = useState<string>(initialData?.start_date ?? new Date().toISOString().split("T")[0]);

  // EMI Override logic
  const [customEmi, setCustomEmi] = useState<string>(initialData?.monthly_emi ?? "");
  const [isEmiOverridden, setIsEmiOverridden] = useState<boolean>(false);

  // Past EMI bulk payment question state
  const [pastEmiOption, setPastEmiOption] = useState<"all" | "selective" | "none">("all");
  const [manualPaidMap, setManualPaidMap] = useState<Record<number, boolean>>({});

  // Active Step: 1 = Form Inputs, 2 = Statement Review & Customization
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // 1. Calculate Standard EMI Formula
  const calculatedEmi = useMemo(() => {
    const P = parseFloat(principalAmount) || 0;
    const r = (parseFloat(interestRate) || 0) / 12 / 100;
    const n = durationMonths || 1;
    if (P <= 0 || n <= 0) return 0;
    if (r === 0) return Math.round(P / n);
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  }, [principalAmount, interestRate, durationMonths]);

  // Effective EMI to use
  const activeEmi = isEmiOverridden && customEmi ? parseFloat(customEmi) || calculatedEmi : calculatedEmi;

  // 2. Calculate End Date & Last EMI Details
  const scheduleDates = useMemo(() => {
    if (!startDate) return { endDateStr: "", lastEmiMonthYear: "", pastCount: 0 };
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + (durationMonths || 1));
    
    const endDateStr = end.toISOString().split("T")[0];
    const lastEmiMonthYear = end.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

    // Count past months
    const today = new Date();
    let pastCount = 0;
    const currentIter = new Date(start);
    for (let i = 0; i < durationMonths; i++) {
      if (currentIter < today) {
        pastCount++;
      }
      currentIter.setMonth(currentIter.getMonth() + 1);
    }

    return { endDateStr, lastEmiMonthYear, pastCount };
  }, [startDate, durationMonths]);

  // 3. Generate Complete Amortization Schedule
  const fullSchedule = useMemo<EmiScheduleRow[]>(() => {
    const P = parseFloat(principalAmount) || 0;
    const r = (parseFloat(interestRate) || 0) / 12 / 100;
    const n = durationMonths || 1;
    const emi = activeEmi;
    if (P <= 0 || n <= 0) return [];

    let balance = P;
    const today = new Date();
    const rows: EmiScheduleRow[] = [];

    const baseStart = startDate ? new Date(startDate) : new Date();

    for (let i = 1; i <= n; i++) {
      const dueDateObj = new Date(baseStart);
      dueDateObj.setMonth(dueDateObj.getMonth() + (i - 1));
      const dueDateStr = dueDateObj.toISOString().split("T")[0];
      const formattedDate = dueDateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

      const interestComp = Math.round(balance * r);
      const principalComp = Math.min(balance, Math.max(0, emi - interestComp));
      balance = Math.max(0, balance - principalComp);

      const isPast = dueDateObj < today;

      // Determine payment status
      let isPaid = false;
      if (manualPaidMap[i] !== undefined) {
        isPaid = manualPaidMap[i];
      } else if (isPast) {
        if (pastEmiOption === "all") isPaid = true;
        else if (pastEmiOption === "none") isPaid = false;
      }

      rows.push({
        monthIndex: i,
        dueDate: dueDateStr,
        formattedDate,
        emiAmount: emi,
        principalComponent: principalComp,
        interestComponent: interestComp,
        remainingBalance: balance,
        isPast,
        isPaid,
      });
    }

    return rows;
  }, [principalAmount, interestRate, durationMonths, activeEmi, startDate, pastEmiOption, manualPaidMap]);

  // Summary Metrics
  const totalInterest = useMemo(() => {
    return fullSchedule.reduce((acc, row) => acc + row.interestComponent, 0);
  }, [fullSchedule]);

  const totalPaymentWithFees = useMemo(() => {
    const fee = parseFloat(processingFee) || 0;
    const P = parseFloat(principalAmount) || 0;
    return P + totalInterest + fee;
  }, [principalAmount, totalInterest, processingFee]);

  const paidCount = fullSchedule.filter((r) => r.isPaid).length;
  const totalPaidSoFar = fullSchedule.filter((r) => r.isPaid).reduce((acc, r) => acc + r.emiAmount, 0);

  // Toggle single row status
  const toggleRowPaid = (monthIndex: number) => {
    setManualPaidMap((prev) => ({
      ...prev,
      [monthIndex]: !fullSchedule.find((r) => r.monthIndex === monthIndex)?.isPaid,
    }));
  };

  // Submit Handler
  const handleFinalSubmit = async () => {
    if (!name.trim()) {
      showToast("Please enter a loan name.", "error");
      return;
    }
    if (!lenderName.trim()) {
      showToast("Please enter lender name.", "error");
      return;
    }

    setLoading(true);
    try {
      const payload: LoanFormData = {
        name,
        loan_type: loanType as any,
        lender_name: lenderName,
        account_number: accountNumber || undefined,
        principal_amount: principalAmount,
        interest_rate: interestRate,
        monthly_emi: activeEmi.toString(),
        start_date: startDate,
        end_date: scheduleDates.endDateStr,
        status: "active",
        notes: notes || undefined,
        is_escrow: isEscrow,
      };

      const createdLoan = await loansService.createLoan(payload);

      // Create confirmed payments for all marked paid EMIs
      const paidRows = fullSchedule.filter((r) => r.isPaid);
      if (paidRows.length > 0) {
        for (const row of paidRows) {
          try {
            await loansService.createPayment({
              loan: createdLoan.id,
              amount: row.emiAmount.toString(),
              payment_date: row.dueDate,
              payment_method: "auto_debit",
              notes: `Recorded past EMI payment for month ${row.monthIndex}`,
              status: "confirmed",
              principal_component: row.principalComponent.toString(),
              interest_component: row.interestComponent.toString(),
            });
          } catch {
            // Fallback: use paymentsService directly
            try {
              const { paymentsService } = require("@/services/payments.service");
              await paymentsService.createPayment(createdLoan.id, {
                amount: row.emiAmount.toString(),
                payment_date: row.dueDate,
                payment_method: "auto_debit",
                notes: `Recorded past EMI payment for month ${row.monthIndex}`,
                status: "confirmed",
                principal_component: row.principalComponent.toString(),
                interest_component: row.interestComponent.toString(),
              });
            } catch {}
          }
        }
      }

      if (isEscrow && walletAddress) {
        try {
          await createEscrowLoan(createdLoan.id, principalAmount);
          showToast("Loan & Escrow contract created successfully!", "success");
        } catch {
          showToast("Loan created, but failed to initialize escrow contract.", "warning");
        }
      } else {
        showToast(`Loan created! ${paidRows.length} past payments recorded.`, "success");
      }

      router.push(`/dashboard/loans/${createdLoan.id}`);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to create loan. Please check input.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Plan Quota Check Banner */}
      {!isEdit && !quotaCheck.allowed && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/30 text-white space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm uppercase tracking-wider">
            <Lock className="w-5 h-5" /> Loan Limit Reached ({usageStats.loans_count} / {currentPlan?.max_loans})
          </div>
          <p className="text-sm text-slate-300">{quotaCheck.reason}</p>
          <button
            type="button"
            onClick={() => openPaywall({ reason: quotaCheck.reason })}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-indigo-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300" /> Upgrade Plan to Add Unlimited Loans
          </button>
        </div>
      )}

      {/* Step Stepper Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentStep === 1
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
            Loan Setup & EMI Auto-Calculator
          </button>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentStep === 2
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
            Complete Schedule & Statement Review
          </button>
        </div>

        <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 hidden sm:inline-block">
          ⚡ Auto-Emi & Past Schedule Engine
        </span>
      </div>

      {/* STEP 1: INPUT FORM & CALCULATOR */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Section A: Basic Info */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <FileText className="w-4 h-4" /> 1. Loan Overview & Lender Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Loan Name"
                placeholder="e.g. HDFC Dream Home Loan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Select
                label="Loan Category"
                options={LOAN_TYPE_OPTIONS}
                value={loanType}
                onChange={(val) => setLoanType(val as any)}
                required
              />
              <Input
                label="Lender Institution Name"
                placeholder="e.g. HDFC Bank / SBI / ICICI"
                value={lenderName}
                onChange={(e) => setLenderName(e.target.value)}
                required
              />
              <Input
                label="Account / Application Number"
                placeholder="e.g. HL-908123 (Optional)"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Section B: Financials & Smart EMI Auto-Calculator */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Calculator className="w-4 h-4" /> 2. Principal, Duration & Fee Details
              </h3>
              <span className="text-xs text-slate-400 font-mono">Auto-recalculates EMI live</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Principal Amount (₹)</label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:border-purple-500 focus:outline-none"
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(e.target.value)}
                  placeholder="500000"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:border-purple-500 focus:outline-none"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="10.5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Tenure (Months)</label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:border-purple-500 focus:outline-none"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(parseInt(e.target.value) || 12)}
                  placeholder="36"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">{(durationMonths / 12).toFixed(1)} Years</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Processing Fee / Charges (₹)</label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:border-purple-500 focus:outline-none"
                  value={processingFee}
                  onChange={(e) => setProcessingFee(e.target.value)}
                  placeholder="2500"
                />
              </div>
            </div>

            {/* Smart Calculated EMI Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-indigo-950/40 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-inner">
              <div className="space-y-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Auto-Calculated Monthly EMI
                </span>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-white font-mono tracking-tight">
                    {formatCurrency(activeEmi)}
                  </p>
                  <span className="text-xs text-slate-400 font-mono">/ month</span>
                </div>
                <p className="text-xs text-slate-400">
                  Total Interest Component: <strong className="text-amber-400">{formatCurrency(totalInterest)}</strong>
                </p>
              </div>

              <div className="flex flex-col items-end space-y-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setIsEmiOverridden(!isEmiOverridden)}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold underline flex items-center gap-1 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  {isEmiOverridden ? "Use Auto-Calculated EMI" : "Override & Set Custom EMI"}
                </button>

                {isEmiOverridden && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 font-mono">Custom EMI: ₹</span>
                    <input
                      type="number"
                      className="w-32 px-3 py-1.5 rounded-lg bg-slate-900 border border-purple-500 text-white text-xs font-mono focus:outline-none"
                      value={customEmi}
                      onChange={(e) => setCustomEmi(e.target.value)}
                      placeholder={calculatedEmi.toString()}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section C: Start Date & Past EMI Decision */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> 3. Schedule, Start Date & Past EMI Settlement
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 block">Loan Disbursement / Start Date</label>
                <input
                  type="date"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:border-purple-500 focus:outline-none"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-mono text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Final EMI Maturity Date:</span>
                    <strong className="text-emerald-400">{scheduleDates.endDateStr || "N/A"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last EMI Details:</span>
                    <strong className="text-purple-300">{scheduleDates.lastEmiMonthYear}</strong>
                  </div>
                </div>
              </div>

              {/* Past EMI Question Box if start date is in the past */}
              {scheduleDates.pastCount > 0 && (
                <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Clock className="w-4 h-4" /> Past EMIs Detected ({scheduleDates.pastCount} months elapsed)
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    This loan started on <strong className="text-white">{startDate}</strong>. Have you paid all prior EMIs up to last month?
                  </p>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        name="past_emi"
                        className="accent-amber-500"
                        checked={pastEmiOption === "all"}
                        onChange={() => setPastEmiOption("all")}
                      />
                      <span>✅ Yes, all {scheduleDates.pastCount} past EMIs are fully paid up to date</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        name="past_emi"
                        className="accent-amber-500"
                        checked={pastEmiOption === "selective"}
                        onChange={() => setPastEmiOption("selective")}
                      />
                      <span>🔍 Let me selectively mark which specific months were paid</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        name="past_emi"
                        className="accent-amber-500"
                        checked={pastEmiOption === "none"}
                        onChange={() => setPastEmiOption("none")}
                      />
                      <span>❌ No past EMIs have been paid yet</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action to Step 2 */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-xl flex items-center gap-2 cursor-pointer"
            >
              <span>Review Complete Statement & Past Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: COMPLETE STATEMENT & EMI SELECTION STUDIO */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block">
                  Loan Statement Preview & Multi-Month EMI Manager
                </span>
                <h2 className="text-xl font-black text-white">{name || "Unnamed Loan"}</h2>
                <p className="text-xs text-slate-400">{lenderName} • {durationMonths} Months Tenure</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
                >
                  ← Edit Terms
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Creating Loan...
                    </span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm & Create Loan Schedule
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block">Principal Borrowed</span>
                <p className="text-base font-bold text-white">{formatCurrency(parseFloat(principalAmount) || 0)}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block">Total Interest</span>
                <p className="text-base font-bold text-amber-400">{formatCurrency(totalInterest)}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block">Total Outstanding</span>
                <p className="text-base font-bold text-purple-400">{formatCurrency(totalPaymentWithFees)}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block">EMIs Marked Paid</span>
                <p className="text-base font-bold text-emerald-400">{paidCount} / {durationMonths}</p>
              </div>
            </div>
          </div>

          {/* Complete Interactive Schedule Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" /> Complete Amortization Statement ({fullSchedule.length} EMIs)
                </h3>
                <p className="text-xs text-slate-400">Click any EMI row to toggle its paid/unpaid status before saving</p>
              </div>
              <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {paidCount} Paid • {fullSchedule.length - paidCount} Remaining
              </span>
            </div>

            <div className="overflow-x-auto max-h-96 overflow-y-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
                  <tr>
                    <th className="p-3"># Month</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">EMI Amount</th>
                    <th className="p-3">Principal</th>
                    <th className="p-3">Interest</th>
                    <th className="p-3">Balance</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {fullSchedule.map((row) => (
                    <tr
                      key={row.monthIndex}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        row.isPaid ? "bg-emerald-950/10" : ""
                      }`}
                    >
                      <td className="p-3 font-bold text-slate-300">Month {row.monthIndex}</td>
                      <td className="p-3 text-slate-400">{row.formattedDate}</td>
                      <td className="p-3 font-bold text-white">{formatCurrency(row.emiAmount)}</td>
                      <td className="p-3 text-slate-400">{formatCurrency(row.principalComponent)}</td>
                      <td className="p-3 text-amber-400/80">{formatCurrency(row.interestComponent)}</td>
                      <td className="p-3 text-purple-300 font-bold">{formatCurrency(row.remainingBalance)}</td>
                      <td className="p-3 text-center">
                        {row.isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Check className="w-3 h-3" /> Already Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-400 border border-slate-700">
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => toggleRowPaid(row.monthIndex)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                            row.isPaid
                              ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                              : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                          }`}
                        >
                          {row.isPaid ? "Mark Unpaid" : "Mark Paid"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Final Action Bar */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-xl"
            >
              ← Back to Terms
            </button>

            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-xl shadow-xl flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Creating Loan...
                </span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Finalize & Create Loan
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
