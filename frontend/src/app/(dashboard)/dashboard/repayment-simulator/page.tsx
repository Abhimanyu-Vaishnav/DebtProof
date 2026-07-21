"use client";

import React, { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { loansService } from "@/services/loans.service";
import { formatCurrency } from "@/utils/formatters";

import { PayoffMethodComparisonModal } from "@/components/analytics/PayoffMethodComparisonModal";

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
  const [showComparisonModal, setShowComparisonModal] = useState(false);

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

  const baselineMonths = baseline?.months || 0;
  const snowballMonths = snowball?.months || 0;
  const avalancheMonths = avalanche?.months || 0;

  // Find max months for chart scaling safely without NaN
  const maxMonths = Math.max(baselineMonths, snowballMonths, avalancheMonths, 12);
  const maxOutstanding = Math.max(
    baseline?.history && baseline.history.length > 0 ? baseline.history[0].outstanding : 0,
    1000
  );

  // Generate SVG Points — chart area: x: 95→710, y: 15→215
  const CHART_LEFT = 95;
  const CHART_WIDTH = 615;
  const CHART_TOP = 15;
  const CHART_HEIGHT = 200;

  const getSvgPoints = (historyList: any[]) => {
    if (!historyList || historyList.length === 0 || maxOutstanding === 0)
      return `${CHART_LEFT},${CHART_TOP + CHART_HEIGHT}`;
    const pts = historyList
      .map((pt) => {
        const x = CHART_LEFT + Math.min(CHART_WIDTH, Math.max(0, ((pt.month - 1) / maxMonths) * CHART_WIDTH));
        const y = CHART_TOP + Math.min(CHART_HEIGHT, Math.max(0, CHART_HEIGHT - (pt.outstanding / maxOutstanding) * CHART_HEIGHT));
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    return pts;
  };

  return (
    <>
      <Topbar title="Repayment Simulator" subtitle="Simulate extra monthly contributions and compare snowball vs avalanche payoff strategies" />
      <main className="page-content space-y-6">
        
        {/* Interactive Extra Payment Slider & Custom Input */}
        <div className="card p-4 sm:p-6 border border-[var(--color-border-light)] space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">Extra Monthly Contribution</h2>
              <p className="text-xs text-[var(--color-text-secondary)]">Increase your monthly payoff amount to see how much interest and time you save.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => setShowComparisonModal(true)}
                className="btn btn-secondary btn-sm h-[40px] px-3 font-bold text-xs shrink-0 flex items-center gap-1"
              >
                ⚖️ Compare Strategies
              </button>
              <form onSubmit={handleCustomInputSubmit} className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  className="input py-2 px-3 w-full sm:w-36 text-sm font-bold text-[var(--color-text-primary)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl"
                  placeholder="Custom amount"
                  value={extraMonthly}
                  onChange={handleCustomInputChange}
                />
                <button type="submit" className="btn btn-primary btn-sm h-[40px] px-4 shrink-0 font-bold">Apply</button>
              </form>
              <div className="flex justify-between sm:block text-left sm:text-right border-t sm:border-t-0 sm:border-l border-[var(--color-border-light)] pt-2 sm:pt-0 sm:pl-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] block">Simulated Extra</span>
                <span className="text-xl sm:text-2xl font-black text-[var(--color-primary)]">{formatCurrency(extraMonthly)}/mo</span>
              </div>
            </div>
          </div>

          {/* Quick preset amount chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] shrink-0 mr-1">Quick Add:</span>
            {[5000, 10000, 25000, 50000, 100000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setExtraMonthly(amt);
                  fetchSimulation(amt);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 transition-all border ${
                  extraMonthly === amt
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-xs"
                    : "bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border-light)] hover:bg-[var(--color-surface-tertiary)]"
                }`}
              >
                +₹{amt.toLocaleString("en-IN")}
              </button>
            ))}
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
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-[var(--color-text-tertiary)] font-bold uppercase overflow-x-auto">
              <span>₹0</span>
              <span>₹30k</span>
              <span>₹60k</span>
              <span>₹90k</span>
              <span>₹120k</span>
              <span>₹150k+</span>
            </div>
          </div>
        </div>

        {/* Strategy Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Baseline */}
          <div className="card p-4 sm:p-5 border-t-4 border-slate-500 bg-[var(--color-surface)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 gap-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Baseline Plan</h3>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-900 text-[var(--color-text-tertiary)] px-2 py-0.5 rounded-full font-bold shrink-0">Standard EMIs</span>
              </div>
              <div className="space-y-3 mt-4">
                <div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">Debt-Free Date</span>
                  <p className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">{formatDebtFreeDate(baseline.debt_free_date)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">Total Interest</span>
                  <p className="text-base sm:text-lg font-bold text-rose-500">{formatCurrency(baseline.total_interest)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">Time to payoff</span>
                  <p className="text-sm font-semibold text-[var(--color-text-secondary)]">{baseline.months} Months</p>
                </div>
              </div>
            </div>
          </div>

          {/* Snowball */}
          <div className="card p-4 sm:p-5 border-t-4 border-blue-500 bg-[var(--color-surface)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 gap-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Debt Snowball</h3>
                <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-bold shrink-0">Lowest Balance First</span>
              </div>
              <div className="space-y-3 mt-4">
                <div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">Debt-Free Date</span>
                  <p className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">{formatDebtFreeDate(snowball.debt_free_date)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">Total Interest</span>
                  <p className="text-base sm:text-lg font-bold text-rose-500">{formatCurrency(snowball.total_interest)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-border-light)]">
                  <div>
                    <span className="text-[9px] text-[var(--color-text-tertiary)] uppercase font-bold">Time Saved</span>
                    <p className="text-sm sm:text-base font-bold text-emerald-500">{snowball.months_saved} Mos</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-[var(--color-text-tertiary)] uppercase font-bold">Interest Saved</span>
                    <p className="text-sm sm:text-base font-bold text-emerald-500">{formatCurrency(snowball.interest_saved)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Avalanche */}
          <div className="card p-4 sm:p-5 border-t-4 border-emerald-500 bg-[var(--color-surface)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-lg">
              Optimal Savings
            </div>
            <div>
              <div className="flex items-center justify-between mb-3 gap-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Debt Avalanche</h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold shrink-0">Highest Interest First</span>
              </div>
              <div className="space-y-3 mt-4">
                <div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">Debt-Free Date</span>
                  <p className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">{formatDebtFreeDate(avalanche.debt_free_date)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">Total Interest</span>
                  <p className="text-base sm:text-lg font-bold text-rose-500">{formatCurrency(avalanche.total_interest)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-border-light)]">
                  <div>
                    <span className="text-[9px] text-[var(--color-text-tertiary)] uppercase font-bold">Time Saved</span>
                    <p className="text-sm sm:text-base font-bold text-emerald-500">{avalanche.months_saved} Mos</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-[var(--color-text-tertiary)] uppercase font-bold">Interest Saved</span>
                    <p className="text-sm sm:text-base font-bold text-emerald-500">{formatCurrency(avalanche.interest_saved)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <PayoffChartsContainer
          baseline={baseline}
          snowball={snowball}
          avalanche={avalanche}
          baselineMonths={baselineMonths}
          snowballMonths={snowballMonths}
          avalancheMonths={avalancheMonths}
          maxMonths={maxMonths}
          maxOutstanding={maxOutstanding}
          getSvgPoints={getSvgPoints}
          updating={updating}
        />

        <PayoffScheduleTabs simulations={simData} />

        {showComparisonModal && (
          <PayoffMethodComparisonModal
            onClose={() => setShowComparisonModal(false)}
            baselineData={baseline}
            snowballData={snowball}
            avalancheData={avalanche}
            extraMonthly={extraMonthly}
          />
        )}
      </main>
    </>
  );
}

interface ScheduleItem {
  month: number;
  outstanding_before: number;
  interest_charged: number;
  regular_payment: number;
  extra_payment: number;
  total_payment: number;
  outstanding_after: number;
}

function PayoffScheduleTabs({ simulations }: { simulations: any }) {
  const [activeTab, setActiveTab] = useState<"baseline" | "snowball" | "avalanche">("avalanche");

  const schedule: ScheduleItem[] = simulations[activeTab]?.schedule || [];

  return (
    <div className="card p-4 sm:p-6 border border-[var(--color-border-light)] space-y-4 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[var(--color-border-light)] pb-4 gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">Repayment Schedule Table</h3>
          <p className="text-[11px] text-[var(--color-text-secondary)]">Month-by-month payment ledger under selected strategy</p>
        </div>
        <div className="flex rounded-lg bg-[var(--color-surface-secondary)] p-1 border border-[var(--color-border-light)] overflow-x-auto shrink-0">
          {(["baseline", "snowball", "avalanche"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md capitalize transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {schedule.length === 0 ? (
        <p className="text-xs text-[var(--color-text-tertiary)] text-center py-6">No schedule coordinates generated.</p>
      ) : (
        <div className="w-full max-w-full overflow-x-auto max-h-[350px] overflow-y-auto pr-1">
          <table className="w-full min-w-[560px] text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-[var(--color-surface)] shadow-xs">
              <tr className="border-b border-[var(--color-border-light)] text-[var(--color-text-tertiary)] bg-[var(--color-surface-secondary)] whitespace-nowrap">
                <th className="py-2.5 px-3 font-bold uppercase text-[10px] whitespace-nowrap">Month</th>
                <th className="py-2.5 px-3 font-bold uppercase text-[10px] whitespace-nowrap">Starting Bal</th>
                <th className="py-2.5 px-3 font-bold uppercase text-[10px] whitespace-nowrap">Interest Added</th>
                <th className="py-2.5 px-3 font-bold uppercase text-[10px] whitespace-nowrap">Min Pay</th>
                <th className="py-2.5 px-3 font-bold uppercase text-[10px] whitespace-nowrap">Extra Pay</th>
                <th className="py-2.5 px-3 font-bold uppercase text-[10px] whitespace-nowrap">Total Pay</th>
                <th className="py-2.5 px-3 font-bold uppercase text-[10px] whitespace-nowrap">Ending Bal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-light)]/40">
              {schedule.map((row) => (
                <tr key={row.month} className="hover:bg-[var(--color-surface-secondary)]/30 text-[var(--color-text-secondary)] whitespace-nowrap">
                  <td className="py-2.5 px-3 font-semibold text-[var(--color-text-primary)] whitespace-nowrap">Month {row.month}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">{formatCurrency(row.outstanding_before)}</td>
                  <td className="py-2.5 px-3 text-rose-500 font-semibold whitespace-nowrap">+ {formatCurrency(row.interest_charged)}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">{formatCurrency(row.regular_payment)}</td>
                  <td className="py-2.5 px-3 text-emerald-500 font-bold whitespace-nowrap">{row.extra_payment > 0 ? `+ ${formatCurrency(row.extra_payment)}` : "—"}</td>
                  <td className="py-2.5 px-3 font-bold text-[var(--color-text-primary)] whitespace-nowrap">{formatCurrency(row.total_payment)}</td>
                  <td className="py-2.5 px-3 font-semibold text-[var(--color-text-primary)] whitespace-nowrap">
                    {row.outstanding_after > 0 ? formatCurrency(row.outstanding_after) : <span className="text-emerald-500 font-extrabold">Paid Off! 🎉</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface ChartsProps {
  baseline: any;
  snowball: any;
  avalanche: any;
  baselineMonths: number;
  snowballMonths: number;
  avalancheMonths: number;
  maxMonths: number;
  maxOutstanding: number;
  getSvgPoints: (history: any[]) => string;
  updating: boolean;
}

type ChartFormat = "line" | "bar" | "pie";

function PayoffChartsContainer({
  baseline,
  snowball,
  avalanche,
  baselineMonths,
  snowballMonths,
  avalancheMonths,
  maxMonths,
  maxOutstanding,
  getSvgPoints,
  updating,
}: ChartsProps) {
  const [chartFormat, setChartFormat] = useState<ChartFormat>("line");

  // Calculations for Bar (Interest comparison) and Pie (Savings split)
  const baseInt = baseline.total_interest || 0;
  const snowInt = snowball.total_interest || 0;
  const avalInt = avalanche.total_interest || 0;

  const interestSavedSnowball = Math.max(0, baseInt - snowInt);
  const interestSavedAvalanche = Math.max(0, baseInt - avalInt);

  // SVG Pie math helper
  const totalDebtSplit = baseInt + snowInt + avalInt || 1;
  const pctBase = (baseInt / totalDebtSplit) * 100;
  const pctSnow = (snowInt / totalDebtSplit) * 100;
  const pctAval = (avalInt / totalDebtSplit) * 100;

  return (
    <div className="card p-4 sm:p-6 border border-[var(--color-border-light)] space-y-4 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[var(--color-border-light)] pb-3 gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">Visual Analytics</h3>
          <p className="text-[11px] text-[var(--color-text-secondary)]">Choose layout format to visualize repayment strategies</p>
        </div>
        <div className="flex rounded-lg bg-[var(--color-surface-secondary)] p-1 border border-[var(--color-border-light)] overflow-x-auto shrink-0">
          {(["line", "bar", "pie"] as const).map((format) => (
            <button
              key={format}
              onClick={() => setChartFormat(format)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md capitalize transition-colors whitespace-nowrap ${
                chartFormat === format
                  ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              {format === "line" ? "Timeline Chart" : format === "bar" ? "Interest Bar" : "Interest Share Pie"}
            </button>
          ))}
        </div>
      </div>

      <div className="relative pt-4 px-2 pb-6 min-h-[260px] flex items-center justify-center">
        {updating && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center z-10 rounded-xl">
            <div className="flex items-center gap-2 bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border-light)] shadow-md">
              <span className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-[var(--color-text-primary)]">Recalculating...</span>
            </div>
          </div>
        )}

        {/* ── 1. LINE CHART (TIMELINE PROGRESSION) ───────────────────────────── */}
        {chartFormat === "line" && (
          <div className="w-full space-y-3">
            {/* Responsive Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-400 shrink-0" />
                  <span className="text-[11px] font-bold text-[var(--color-text-secondary)]">Baseline</span>
                </div>
                <span className="text-xs font-black text-[var(--color-text-primary)]">{baselineMonths} mos</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-[11px] font-bold text-blue-500">Snowball</span>
                </div>
                <span className="text-xs font-black text-blue-500">{snowball?.months ?? 0} mos</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-[11px] font-bold text-emerald-500">Avalanche</span>
                </div>
                <span className="text-xs font-black text-emerald-500">{avalanche?.months ?? 0} mos</span>
              </div>
            </div>

            {/* SVG Chart Container — scalable 100% width on any device */}
            <div className="w-full">
              <svg viewBox="0 0 740 260" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="lgBase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="lgSnow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="lgAval" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                {[15, 65, 115, 165, 215].map((y) => (
                  <line key={y} x1="55" y1={y} x2="720" y2={y}
                    stroke="var(--color-border-light)" strokeWidth="1"
                    strokeDasharray={y === 215 ? "0" : "4 3"} opacity={y === 215 ? "0.8" : "0.4"}
                  />
                ))}

                {/* Y-axis labels */}
                <text x="48" y="19" textAnchor="end" fontSize="11" fontWeight="700" fill="var(--color-text-secondary)">
                  {maxOutstanding >= 100000 ? `₹${(maxOutstanding / 100000).toFixed(1)}L` : `₹${Math.round(maxOutstanding / 1000)}k`}
                </text>
                <text x="48" y="119" textAnchor="end" fontSize="11" fontWeight="700" fill="var(--color-text-secondary)">
                  {maxOutstanding >= 100000 ? `₹${(maxOutstanding / 200000).toFixed(1)}L` : `₹${Math.round(maxOutstanding / 2000)}k`}
                </text>
                <text x="48" y="219" textAnchor="end" fontSize="11" fontWeight="700" fill="var(--color-text-secondary)">₹0</text>

                {/* Y-axis line */}
                <line x1="52" y1="15" x2="52" y2="217" stroke="var(--color-border-light)" strokeWidth="1.5" opacity="0.6" />

                {/* Fill areas */}
                <path d={`M 55,215 L ${getSvgPoints(baseline.history)} L 720,215 Z`} fill="url(#lgBase)" />
                <path d={`M 55,215 L ${getSvgPoints(snowball.history)} L 720,215 Z`} fill="url(#lgSnow)" />
                <path d={`M 55,215 L ${getSvgPoints(avalanche.history)} L 720,215 Z`} fill="url(#lgAval)" />

                {/* Lines */}
                <polyline fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  points={getSvgPoints(baseline.history)} />
                <polyline fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="8 4"
                  points={getSvgPoints(snowball.history)} />
                <polyline fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  points={getSvgPoints(avalanche.history)} />

                {/* X-axis labels */}
                <text x="55" y="242" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-text-tertiary)">Start</text>
                <text x="387" y="242" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-text-tertiary)">Month {Math.round(maxMonths / 2)}</text>
                <text x="720" y="242" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-text-tertiary)">Month {maxMonths}</text>
              </svg>
            </div>
          </div>
        )}

        {/* ── 2. BAR CHART (INTEREST PAYABLE COMPARISON) ─────────────────── */}
        {chartFormat === "bar" && (
          <div className="w-full max-w-lg space-y-5 pt-2">
            <div className="space-y-4">
              {/* Baseline Bar */}
              <div className="space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold text-[var(--color-text-secondary)] gap-1">
                  <span>Baseline (No Extra Contribution)</span>
                  <span className="text-rose-500 font-extrabold">{formatCurrency(baseInt)}</span>
                </div>
                <div className="h-6 w-full bg-[var(--color-surface-tertiary)] rounded-md overflow-hidden border border-[var(--color-border-light)]">
                  <div className="h-full bg-slate-400 rounded-md transition-all duration-700" style={{ width: "100%" }} />
                </div>
              </div>

              {/* Snowball Bar */}
              <div className="space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold text-[var(--color-text-secondary)] gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>Debt Snowball</span>
                    <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">Saves {formatCurrency(interestSavedSnowball)}</span>
                  </div>
                  <span className="text-[var(--color-text-primary)] font-extrabold">{formatCurrency(snowInt)}</span>
                </div>
                <div className="h-6 w-full bg-[var(--color-surface-tertiary)] rounded-md overflow-hidden border border-[var(--color-border-light)]">
                  <div
                    className="h-full bg-blue-500 rounded-md transition-all duration-700"
                    style={{ width: `${baseInt > 0 ? (snowInt / baseInt) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Avalanche Bar */}
              <div className="space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold text-[var(--color-text-secondary)] gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>Debt Avalanche</span>
                    <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">Saves {formatCurrency(interestSavedAvalanche)}</span>
                  </div>
                  <span className="text-[var(--color-text-primary)] font-extrabold">{formatCurrency(avalInt)}</span>
                </div>
                <div className="h-6 w-full bg-[var(--color-surface-tertiary)] rounded-md overflow-hidden border border-[var(--color-border-light)]">
                  <div
                    className="h-full bg-emerald-500 rounded-md transition-all duration-700"
                    style={{ width: `${baseInt > 0 ? (avalInt / baseInt) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-[var(--color-text-tertiary)] text-center font-semibold uppercase tracking-wider">Lower interest bar is better</p>
          </div>
        )}

        {/* ── 3. PIE CHART (INTEREST PORTION DISTRIBUTION) ───────────────── */}
        {chartFormat === "pie" && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full max-w-lg">
            {/* SVG Donut Circle */}
            <div className="relative w-40 h-40 shrink-0">
              <svg width="100%" height="100%" viewBox="0 0 42 42" className="donut overflow-visible">
                <circle className="donut-hole" cx="21" cy="21" r="15.915" fill="transparent" />
                <circle className="donut-ring" cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--color-border-light)" strokeWidth="4.5" />

                {/* Segment 1: Baseline */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#94a3b8"
                  strokeWidth="4.5"
                  strokeDasharray={`${pctBase} ${100 - pctBase}`}
                  strokeDashoffset="25"
                />

                {/* Segment 2: Snowball */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="4.5"
                  strokeDasharray={`${pctSnow} ${100 - pctSnow}`}
                  strokeDashoffset={125 - pctBase}
                />

                {/* Segment 3: Avalanche */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="4.5"
                  strokeDasharray={`${pctAval} ${100 - pctAval}`}
                  strokeDashoffset={125 - pctBase - pctSnow}
                />
              </svg>
              {/* Inner Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[9px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-bold">Total simulated</span>
                <span className="text-sm font-black text-[var(--color-text-primary)]">Interest Split</span>
              </div>
            </div>

            {/* Side Legend with Share info */}
            <div className="space-y-3 text-xs w-full">
              <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-400 rounded-sm" />
                  <span className="font-semibold">Baseline Plan</span>
                </div>
                <span className="font-bold text-[var(--color-text-primary)]">{pctBase.toFixed(0)}% share</span>
              </div>
              <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                  <span className="font-semibold">Debt Snowball</span>
                </div>
                <span className="font-bold text-[var(--color-text-primary)]">{pctSnow.toFixed(0)}% share</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                  <span className="font-semibold">Debt Avalanche</span>
                </div>
                <span className="font-bold text-[var(--color-text-primary)]">{pctAval.toFixed(0)}% share</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

