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

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setExtraMonthly(val);
  };

  const handleCustomInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
  const maxOutstanding = Math.max(
    baseline.history.length > 0 ? baseline.history[0].outstanding : 0,
    1000
  );

  // Generate SVG Points for Progression Chart
  const getSvgPoints = (historyList: any[]) => {
    if (!historyList || historyList.length === 0 || maxOutstanding === 0) return "0,200";
    const width = 600;
    const height = 200;
    const pts = historyList
      .map((pt) => {
        const x = Math.min(width, Math.max(0, ((pt.month - 1) / maxMonths) * width));
        const y = Math.min(height, Math.max(0, height - (pt.outstanding / maxOutstanding) * height));
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    return pts;
  };

  return (
    <>
      <Topbar title="Repayment Simulator" subtitle="Simulate extra monthly contributions and compare snowball vs avalanche payoff strategies" />
      <main className="page-content space-y-6">
        
        {/* Slider & Custom Input Card */}
        <div className="card p-6 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-secondary)] border border-[var(--color-border-light)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Extra Monthly Contribution</h2>
              <p className="text-xs text-[var(--color-text-secondary)]">Increase your monthly payoff amount to see how much interest and time you save.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <form onSubmit={handleCustomInputSubmit} className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  className="input py-1.5 px-3 w-32 text-sm font-bold text-[var(--color-text-primary)] bg-[var(--color-surface)]"
                  placeholder="Custom amount"
                  value={extraMonthly}
                  onChange={handleCustomInputChange}
                />
                <button type="submit" className="btn btn-primary btn-sm h-[38px]">Apply</button>
              </form>
              <div className="text-right border-l border-[var(--color-border-light)] pl-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] block">Simulated Extra</span>
                <span className="text-2xl font-black text-[var(--color-primary)]">{formatCurrency(extraMonthly)}/mo</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="150000"
              step="5000"
              value={extraMonthly}
              onChange={handleSliderChange}
              onMouseUp={handleSliderRelease}
              onTouchEnd={handleSliderRelease}
              className="w-full h-2 rounded-lg bg-[var(--color-surface-tertiary)] appearance-none cursor-pointer accent-[var(--color-primary)]"
            />
            <div className="flex items-center justify-between text-[10px] text-[var(--color-text-tertiary)] font-bold uppercase">
              <span>₹0 (Baseline)</span>
              <span>₹30,000</span>
              <span>₹60,000</span>
              <span>₹90,000</span>
              <span>₹1,20,000</span>
              <span>₹1,50,000+</span>
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
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">Debt Progression Timeline</h3>
              <p className="text-[11px] text-[var(--color-text-secondary)]">Visualizing outstanding balance depletion over months</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-slate-400 rounded-full" /><span>Baseline ({baseline.months} mos)</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full" /><span>Snowball ({snowball.months} mos)</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /><span>Avalanche ({avalanche.months} mos)</span></div>
            </div>
          </div>

          <div className="relative pt-4 px-2 pb-6">
            {updating && (
              <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center z-10 rounded-xl">
                <div className="flex items-center gap-2 bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border-light)] shadow-md">
                  <span className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">Recalculating...</span>
                </div>
              </div>
            )}

            <div className="w-full">
              <svg viewBox="0 0 600 240" className="w-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="snowballGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="avalancheGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="0" x2="600" y2="0" stroke="var(--color-border-light)" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
                <line x1="0" y1="60" x2="600" y2="60" stroke="var(--color-border-light)" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="var(--color-border-light)" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
                <line x1="0" y1="180" x2="600" y2="180" stroke="var(--color-border-light)" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
                <line x1="0" y1="200" x2="600" y2="200" stroke="var(--color-border)" strokeWidth="1.5" />

                {/* Y-Axis Label Indicators */}
                <text x="-10" y="5" textAnchor="end" fill="var(--color-text-tertiary)" className="text-[9px] font-bold">{formatCurrency(maxOutstanding)}</text>
                <text x="-10" y="105" textAnchor="end" fill="var(--color-text-tertiary)" className="text-[9px] font-bold">{formatCurrency(maxOutstanding / 2)}</text>
                <text x="-10" y="205" textAnchor="end" fill="var(--color-text-tertiary)" className="text-[9px] font-bold">₹0</text>

                {/* Strategy Fill Areas */}
                <path
                  d={`M 0,200 L ${getSvgPoints(baseline.history)} L 600,200 Z`}
                  fill="url(#baselineGrad)"
                  className="transition-all duration-500"
                />
                <path
                  d={`M 0,200 L ${getSvgPoints(snowball.history)} L 600,200 Z`}
                  fill="url(#snowballGrad)"
                  className="transition-all duration-500"
                />
                <path
                  d={`M 0,200 L ${getSvgPoints(avalanche.history)} L 600,200 Z`}
                  fill="url(#avalancheGrad)"
                  className="transition-all duration-500"
                />

                {/* Polyline paths */}
                <polyline
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="3.5"
                  points={getSvgPoints(baseline.history)}
                  className="transition-all duration-500"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3.5"
                  points={getSvgPoints(snowball.history)}
                  className="transition-all duration-500"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  points={getSvgPoints(avalanche.history)}
                  className="transition-all duration-500"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* X-Axis labels */}
                <text x="0" y="222" textAnchor="middle" fill="var(--color-text-tertiary)" className="text-[9px] font-bold">Start</text>
                <text x="300" y="222" textAnchor="middle" fill="var(--color-text-tertiary)" className="text-[9px] font-bold">Month {Math.round(maxMonths / 2)}</text>
                <text x="600" y="222" textAnchor="end" fill="var(--color-text-tertiary)" className="text-[9px] font-bold">Month {maxMonths}</text>
              </svg>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
