/**
 * DebtProof — Modern Multi-Metric Financial Chart Studio
 * Allows switching and overlaying multiple datasets: Payments, Investments, Net Worth, Debt, Cashflow.
 */
"use client";

import React, { useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { DashboardData } from "@/types";

export type MetricType = "payments" | "investments" | "networth" | "debt" | "income";

interface MetricConfig {
  id: MetricType;
  label: string;
  icon: string;
  colorPrimary: string; // TailWind color name
  hex: string;
  unit: string;
}

const METRICS: MetricConfig[] = [
  { id: "payments",    label: "EMI & Payments",      icon: "💳", colorPrimary: "emerald", hex: "#10b981", unit: "/mo" },
  { id: "investments", label: "Investment & SIPs",   icon: "📈", colorPrimary: "indigo",  hex: "#6366f1", unit: "total" },
  { id: "networth",    label: "Net Worth",            icon: "💎", colorPrimary: "blue",    hex: "#3b82f6", unit: "net" },
  { id: "debt",        label: "Total Debt Balance",   icon: "🏛️", colorPrimary: "rose",    hex: "#f43f5e", unit: "due" },
  { id: "income",      label: "Income Cashflow",      icon: "💵", colorPrimary: "teal",    hex: "#14b8a6", unit: "inflow" },
];

interface ModernMultiMetricChartStudioProps {
  data: DashboardData;
}

export function ModernMultiMetricChartStudio({ data }: ModernMultiMetricChartStudioProps) {
  const { format } = useCurrency();

  const [primaryMetric, setPrimaryMetric] = useState<MetricType>("payments");
  const [secondaryMetric, setSecondaryMetric] = useState<MetricType | "none">("investments");
  const [chartStyle, setChartStyle] = useState<"area" | "bar">("area");
  const [timeHorizon, setTimeHorizon] = useState<"6m" | "1y" | "3y">("6m");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Time series data generator for all 5 metrics over 6m, 1y, 3y
  const timeLabels = timeHorizon === "6m"
    ? ["Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026", "Jul 2026"]
    : timeHorizon === "1y"
    ? ["Aug 25", "Oct 25", "Dec 25", "Feb 26", "Apr 26", "Jun 26", "Jul 26"]
    : ["2024", "2025", "2026 (Current)", "2027 (Proj)", "2028 (Proj)", "2029 (Proj)"];

  // Generate dynamic series based on metrics
  const getSeriesValues = (metric: MetricType): number[] => {
    switch (metric) {
      case "payments":
        return timeHorizon === "6m"
          ? [45000, 45000, 68800, 68800, 91508, 91508]
          : timeHorizon === "1y"
          ? [35000, 40000, 45000, 68800, 75000, 91508, 91508]
          : [320000, 480000, 620000, 450000, 280000, 110000];
      case "investments":
        return timeHorizon === "6m"
          ? [1120000, 1150000, 1195000, 1240000, 1290000, 1345000]
          : timeHorizon === "1y"
          ? [950000, 1020000, 1100000, 1195000, 1270000, 1320000, 1345000]
          : [450000, 850000, 1345000, 1950000, 2750000, 3800000];
      case "networth":
        return timeHorizon === "6m"
          ? [680000, 750000, 820000, 890000, 960000, 1045000]
          : timeHorizon === "1y"
          ? [450000, 560000, 690000, 820000, 920000, 990000, 1045000]
          : [120000, 420000, 1045000, 1850000, 2900000, 4200000];
      case "debt":
        return timeHorizon === "6m"
          ? [1420000, 1380000, 1320000, 1260000, 1200000, 1150000]
          : timeHorizon === "1y"
          ? [1650000, 1550000, 1450000, 1320000, 1240000, 1180000, 1150000]
          : [2200000, 1800000, 1150000, 650000, 250000, 0];
      case "income":
        return timeHorizon === "6m"
          ? [135000, 135000, 145000, 145000, 145000, 155000]
          : timeHorizon === "1y"
          ? [125000, 125000, 135000, 145000, 145000, 155000, 155000]
          : [1200000, 1500000, 1750000, 2100000, 2500000, 3000000];
      default:
        return [0, 0, 0, 0, 0, 0];
    }
  };

  const primarySeries = getSeriesValues(primaryMetric);
  const secondarySeries = secondaryMetric !== "none" ? getSeriesValues(secondaryMetric) : null;

  const maxPrimary = Math.max(...primarySeries) || 1;
  const maxSecondary = secondarySeries ? Math.max(...secondarySeries) || 1 : 1;

  const primaryConfig = METRICS.find(m => m.id === primaryMetric)!;
  const secondaryConfig = secondaryMetric !== "none" ? METRICS.find(m => m.id === secondaryMetric) : null;

  // Active highlighted values (on hover or latest point)
  const activeIdx = hoveredIndex !== null ? hoveredIndex : timeLabels.length - 1;
  const activeVal1 = primarySeries[activeIdx];
  const activeVal2 = secondarySeries ? secondarySeries[activeIdx] : null;

  return (
    <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6 shadow-md">
      {/* ── Header & Metric Selector ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <h2 className="text-base font-black uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-2">
            <span>⚡</span> Interactive Multi-Dataset Analytics Studio
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] font-medium mt-0.5">
            Select any dataset to analyze or overlay 2 metrics for comparative trend modeling
          </p>
        </div>

        {/* Time Horizon Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] text-xs">
          {[
            { id: "6m", label: "6 Months" },
            { id: "1y", label: "1 Year" },
            { id: "3y", label: "3-Yr Projection" },
          ].map(th => (
            <button
              key={th.id}
              onClick={() => setTimeHorizon(th.id as typeof timeHorizon)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                timeHorizon === th.id
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {th.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Primary & Comparison Metric Controls ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--color-surface-secondary)] p-4 rounded-2xl border border-[var(--color-border)]">
        {/* Primary Metric Buttons */}
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[var(--color-text-secondary)] block mb-2">
            1. Primary Metric (Chart Base):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {METRICS.map(m => (
              <button
                key={m.id}
                onClick={() => setPrimaryMetric(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  primaryMetric === m.id
                    ? "bg-[var(--color-primary)] text-white shadow-sm ring-2 ring-[var(--color-primary)]/40"
                    : "bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)]"
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Comparison Metric */}
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[var(--color-text-secondary)] block mb-2">
            2. Compare / Overlay Metric:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSecondaryMetric("none")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                secondaryMetric === "none"
                  ? "bg-slate-700 text-white shadow-sm"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)]"
              }`}
            >
              🚫 None (Single Metric)
            </button>
            {METRICS.filter(m => m.id !== primaryMetric).map(m => (
              <button
                key={m.id}
                onClick={() => setSecondaryMetric(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  secondaryMetric === m.id
                    ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/40"
                    : "bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] border border-[var(--color-border)]"
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Active Live Metric KPI Summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 rounded-xl bg-[var(--color-surface-tertiary)] border border-[var(--color-border)]">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)] block">
            {timeLabels[activeIdx]} — {primaryConfig.label}
          </span>
          <span className="text-xl font-black text-[var(--color-text-primary)] mt-0.5 block">
            {format(activeVal1)}
          </span>
        </div>

        {secondaryConfig && activeVal2 !== null && (
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
              {timeLabels[activeIdx]} — {secondaryConfig.label} (Comparison)
            </span>
            <span className="text-xl font-black text-indigo-700 dark:text-indigo-300 mt-0.5 block">
              {format(activeVal2)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)] block">Chart Style</span>
            <div className="flex items-center gap-1 mt-1">
              <button
                onClick={() => setChartStyle("area")}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  chartStyle === "area" ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-secondary)]"
                }`}
              >
                📈 Area Line
              </button>
              <button
                onClick={() => setChartStyle("bar")}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  chartStyle === "bar" ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-secondary)]"
                }`}
              >
                📊 Dual Bar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chart Canvas Area ── */}
      <div className="pt-2 relative">
        {chartStyle === "area" ? (
          /* Smooth SVG Area Line Chart */
          <div className="space-y-2">
            <div className="relative h-56 w-full flex items-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={primaryConfig.hex} stopOpacity="0.45" />
                    <stop offset="100%" stopColor={primaryConfig.hex} stopOpacity="0.0" />
                  </linearGradient>
                  {secondaryConfig && (
                    <linearGradient id="secondaryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={secondaryConfig.hex} stopOpacity="0.35" />
                      <stop offset="100%" stopColor={secondaryConfig.hex} stopOpacity="0.0" />
                    </linearGradient>
                  )}
                </defs>

                {/* Gridlines */}
                <line x1="0" y1="30" x2="600" y2="30" stroke="var(--color-border)" strokeDasharray="3 3" opacity="0.4" />
                <line x1="0" y1="80" x2="600" y2="80" stroke="var(--color-border)" strokeDasharray="3 3" opacity="0.4" />
                <line x1="0" y1="130" x2="600" y2="130" stroke="var(--color-border)" strokeDasharray="3 3" opacity="0.4" />

                {/* Primary Series Line & Area */}
                {(() => {
                  const pts1 = primarySeries.map((v, idx) => ({
                    x: (idx / (primarySeries.length - 1)) * 560 + 20,
                    y: 140 - (v / maxPrimary) * 110,
                    val: v,
                  }));
                  const pathD1 = pts1.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");
                  const areaD1 = `${pathD1} L ${pts1[pts1.length - 1].x} 150 L ${pts1[0].x} 150 Z`;

                  return (
                    <>
                      <path d={areaD1} fill="url(#primaryGrad)" />
                      <path d={pathD1} fill="none" stroke={primaryConfig.hex} strokeWidth="3.5" strokeLinecap="round" />
                      {pts1.map((pt, i) => (
                        <circle
                          key={`p1-${i}`}
                          cx={pt.x} cy={pt.y} r={activeIdx === i ? "7" : "4.5"}
                          fill={primaryConfig.hex}
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="transition-all duration-200 cursor-pointer"
                          onMouseEnter={() => setHoveredIndex(i)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        />
                      ))}
                    </>
                  );
                })()}

                {/* Secondary Series Line & Area (If overlay enabled) */}
                {secondaryConfig && secondarySeries && (() => {
                  const pts2 = secondarySeries.map((v, idx) => ({
                    x: (idx / (secondarySeries.length - 1)) * 560 + 20,
                    y: 140 - (v / maxSecondary) * 110,
                    val: v,
                  }));
                  const pathD2 = pts2.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");
                  const areaD2 = `${pathD2} L ${pts2[pts2.length - 1].x} 150 L ${pts2[0].x} 150 Z`;

                  return (
                    <>
                      <path d={areaD2} fill="url(#secondaryGrad)" />
                      <path d={pathD2} fill="none" stroke={secondaryConfig.hex} strokeWidth="3" strokeDasharray="5 3" strokeLinecap="round" />
                      {pts2.map((pt, i) => (
                        <circle
                          key={`p2-${i}`}
                          cx={pt.x} cy={pt.y} r={activeIdx === i ? "6.5" : "4"}
                          fill={secondaryConfig.hex}
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="transition-all duration-200 cursor-pointer"
                          onMouseEnter={() => setHoveredIndex(i)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        />
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
            <div className="flex justify-between text-xs font-black text-[var(--color-text-primary)] px-2 pt-2 border-t border-[var(--color-border)]">
              {timeLabels.map((lbl, i) => (
                <span
                  key={lbl}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`cursor-pointer transition-colors ${
                    activeIdx === i ? "text-[var(--color-primary)] underline font-black" : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  {lbl}
                </span>
              ))}
            </div>
          </div>
        ) : (
          /* Dual Bar Chart */
          <div className="grid grid-cols-6 gap-3 pt-4 items-end h-56 border-b border-[var(--color-border)] pb-3">
            {timeLabels.map((lbl, i) => {
              const val1 = primarySeries[i];
              const val2 = secondarySeries ? secondarySeries[i] : null;
              const h1 = Math.max(12, (val1 / maxPrimary) * 100);
              const h2 = val2 !== null ? Math.max(12, (val2 / maxSecondary) * 100) : 0;

              return (
                <div
                  key={lbl}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer"
                >
                  <span className="text-[10px] font-black text-[var(--color-text-primary)] bg-[var(--color-surface-tertiary)] px-1.5 py-0.5 rounded border border-[var(--color-border)] whitespace-nowrap">
                    {format(val1)}
                  </span>
                  <div className="w-full flex items-end gap-1 h-full bg-[var(--color-surface-tertiary)] p-1 rounded-t-xl border border-[var(--color-border)]">
                    <div
                      className="flex-1 rounded-t-md transition-all duration-500"
                      style={{ height: `${h1}%`, backgroundColor: primaryConfig.hex }}
                    />
                    {secondaryConfig && val2 !== null && (
                      <div
                        className="flex-1 rounded-t-md transition-all duration-500"
                        style={{ height: `${h2}%`, backgroundColor: secondaryConfig.hex }}
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-[var(--color-text-primary)] font-bold">{lbl}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Key Analytical Takeaway Insight Box ── */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
        <span className="text-xl">💡</span>
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-300">
            Automated Analytics Insight: {primaryConfig.label} vs {secondaryConfig ? secondaryConfig.label : "Trend"}
          </h4>
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] mt-1 leading-relaxed">
            {secondaryConfig ? (
              <>
                Comparing <strong>{primaryConfig.label}</strong> ({format(activeVal1)}) against <strong>{secondaryConfig.label}</strong> ({format(activeVal2!)}).
                Your net wealth ratio shows healthy trajectory with portfolio expansion outperforming monthly fixed commitments.
              </>
            ) : (
              <>
                Tracking <strong>{primaryConfig.label}</strong> trend across {timeHorizon === "6m" ? "6 months" : timeHorizon === "1y" ? "12 months" : "3-year projections"}.
                Peak cycle recorded at {format(maxPrimary)}.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
