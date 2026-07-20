"use client";

import React, { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { loansService } from "@/services/loans.service";
import { formatCurrency } from "@/utils/formatters";

function formatDebtFreeDate(dateStr: string | null) {
  if (!dateStr) return "No active debts!";
  const [year, month] = dateStr.split("-");
  const dateObj = new Date(parseInt(year), parseInt(month) - 1);
  return dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function RepaymentSimulatorPage() {
  const [extraMonthly, setExtraMonthly] = useState(5000);
  const [simData, setSimData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchSimulation = async (value: number) => {
    try {
      const res = await loansService.simulatePayoff(value);
      setSimData(res.simulations);
    } catch (err) {
      console.error("Failed to run payoff simulation", err);
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchSimulation(extraMonthly);
  }, []);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setExtraMonthly(val);
  };

  const handleSliderRelease = () => {
    setUpdating(true);
    fetchSimulation(extraMonthly);
  };

  if (loading && !simData) {
    return (
      <>
        <Topbar title="Repayment Simulator" subtitle="Optimize your repayment strategy" />
        <main className="page-content">
          <LoadingSpinner fullPage label="Calculating projections..." />
        </main>
      </>
    );
  }

  const { baseline, snowball, avalanche } = simData;

  // Find max months for chart scaling
  const maxMonths = Math.max(baseline.months, snowball.months, avalanche.months, 12);
  const maxOutstanding = baseline.history.length > 0 ? baseline.history[0].outstanding : 0;

  // Generate SVG Points for Progression Chart
  const getSvgPoints = (historyList: any[]) => {
    if (!historyList || historyList.length === 0 || maxOutstanding === 0) return "";
    const width = 600;
    const height = 200;
    return historyList
      .map((pt) => {
        const x = ((pt.month - 1) / maxMonths) * width;
        const y = height - (pt.outstanding / maxOutstanding) * height;
        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <>
      <Topbar title="Repayment Simulator" subtitle="Simulate extra monthly contributions and compare snowball vs avalanche payoff strategies" />
      <main className="page-content space-y-6">
        
        {/* Slider Card */}
        <div className="card p-6 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Extra Monthly Contribution</h2>
              <p className="text-xs text-[var(--color-text-secondary)]">Increase your monthly payoff amount to see how much interest and time you save.</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] block">Simulated Extra</span>
              <span className="text-3xl font-black text-[var(--color-primary)]">{formatCurrency(extraMonthly)}/mo</span>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="50000"
              step="1000"
              value={extraMonthly}
              onChange={handleSliderChange}
              onMouseUp={handleSliderRelease}
              onTouchEnd={handleSliderRelease}
              className="w-full h-2 rounded-lg bg-[var(--color-surface-tertiary)] appearance-none cursor-pointer accent-[var(--color-primary)]"
            />
            <div className="flex items-center justify-between text-[10px] text-[var(--color-text-tertiary)] font-bold uppercase">
              <span>₹0 (Baseline)</span>
              <span>₹10,000</span>
              <span>₹20,000</span>
              <span>₹30,000</span>
              <span>₹40,000</span>
              <span>₹50,000</span>
            </div>
          </div>
        </div>

        {/* Strategy Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Baseline */}
          <div className="card p-5 border-t-4 border-slate-500 bg-[var(--color-surface)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Baseline Plan</h3>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-900 text-[var(--color-text-tertiary)] px-2 py-0.5 rounded-full font-bold">Standard EMIs</span>
              </div>
              <div className="space-y-3 mt-4">
                <div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">Debt-Free Date</span>
                  <p className="text-lg font-bold text-[var(--color-text-primary)]">{formatDebtFreeDate(baseline.debt_free_date)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">Total Interest</span>
                  <p className="text-lg font-bold text-rose-500">{formatCurrency(baseline.total_interest)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">Time to payoff</span>
                  <p className="text-sm font-semibold text-[var(--color-text-secondary)]">{baseline.months} Months</p>
                </div>
              </div>
            </div>
          </div>

          {/* Snowball */}
          <div className="card p-5 border-t-4 border-blue-500 bg-[var(--color-surface)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Debt Snowball</h3>
                <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-bold">Lowest Balance First</span>
              </div>
              <div className="space-y-3 mt-4">
                <div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">Debt-Free Date</span>
                  <p className="text-lg font-bold text-[var(--color-text-primary)]">{formatDebtFreeDate(snowball.debt_free_date)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">Total Interest</span>
                  <p className="text-lg font-bold text-rose-500">{formatCurrency(snowball.total_interest)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-border-light)]">
                  <div>
                    <span className="text-[9px] text-[var(--color-text-tertiary)] uppercase font-bold">Time Saved</span>
                    <p className="text-base font-bold text-emerald-500">{snowball.months_saved} Mos</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-[var(--color-text-tertiary)] uppercase font-bold">Interest Saved</span>
                    <p className="text-base font-bold text-emerald-500">{formatCurrency(snowball.interest_saved)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Avalanche */}
          <div className="card p-5 border-t-4 border-emerald-500 bg-[var(--color-surface)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-lg">
              Optimal Savings
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Debt Avalanche</h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">Highest Interest First</span>
              </div>
              <div className="space-y-3 mt-4">
                <div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">Debt-Free Date</span>
                  <p className="text-lg font-bold text-[var(--color-text-primary)]">{formatDebtFreeDate(avalanche.debt_free_date)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">Total Interest</span>
                  <p className="text-lg font-bold text-rose-500">{formatCurrency(avalanche.total_interest)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-border-light)]">
                  <div>
                    <span className="text-[9px] text-[var(--color-text-tertiary)] uppercase font-bold">Time Saved</span>
                    <p className="text-base font-bold text-emerald-500">{avalanche.months_saved} Mos</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-[var(--color-text-tertiary)] uppercase font-bold">Interest Saved</span>
                    <p className="text-base font-bold text-emerald-500">{formatCurrency(avalanche.interest_saved)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Progression Graph */}
        <div className="card p-6 border border-[var(--color-border-light)] space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[var(--color-border-light)]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">Debt Progression Over Time</h3>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-slate-400 rounded-full" /><span>Baseline</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full" /><span>Snowball</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /><span>Avalanche</span></div>
            </div>
          </div>

          <div className="relative pt-4">
            {updating && (
              <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-xs flex items-center justify-center z-10 rounded-xl">
                <span className="text-xs font-semibold">Updating projections...</span>
              </div>
            )}

            <svg viewBox="0 0 600 200" className="w-full overflow-visible">
              {/* Baseline Path */}
              <polyline
                fill="none"
                stroke="#94a3b8"
                strokeWidth="3"
                points={getSvgPoints(baseline.history)}
                className="transition-all duration-500"
              />
              {/* Snowball Path */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                points={getSvgPoints(snowball.history)}
                className="transition-all duration-500"
              />
              {/* Avalanche Path */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                points={getSvgPoints(avalanche.history)}
                className="transition-all duration-500"
              />
            </svg>
          </div>
        </div>
      </main>
    </>
  );
}
