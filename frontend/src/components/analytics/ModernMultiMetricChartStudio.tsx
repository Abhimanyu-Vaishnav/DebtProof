/**
 * DebtProof — Interactive Multi-Metric Chart Studio
 * Select any financial dataset, overlay two metrics, switch chart styles.
 */
"use client";

import React, { useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { DashboardData } from "@/types";

type MetricId = "payments" | "investments" | "networth" | "debt" | "income";
type ChartStyle = "area" | "bar";
type Horizon = "6m" | "1y" | "3y";

interface Metric {
  id: MetricId;
  label: string;
  icon: string;
  hex: string;
  description: string;
}

const METRICS: Metric[] = [
  { id: "payments",    label: "EMI & Payments",    icon: "💳", hex: "#10b981", description: "Monthly loan EMI outflows" },
  { id: "investments", label: "Investments & SIP",  icon: "📈", hex: "#6366f1", description: "Portfolio & SIP accumulation" },
  { id: "networth",    label: "Net Worth",           icon: "💎", hex: "#3b82f6", description: "Assets minus liabilities" },
  { id: "debt",        label: "Debt Balance",        icon: "🏛️", hex: "#f43f5e", description: "Outstanding principal remaining" },
  { id: "income",      label: "Income Cashflow",     icon: "💵", hex: "#f59e0b", description: "Monthly income streams" },
];

const SERIES: Record<MetricId, Record<Horizon, number[]>> = {
  payments: {
    "6m": [45000, 45000, 68800, 68800, 91508, 91508],
    "1y": [35000, 38000, 42000, 45000, 55000, 68800, 75000, 82000, 91508, 91508, 91508, 91508],
    "3y": [420000, 490000, 560000, 620000, 580000, 450000],
  },
  investments: {
    "6m": [1120000, 1150000, 1195000, 1240000, 1290000, 1345000],
    "1y": [950000, 1000000, 1060000, 1120000, 1175000, 1220000, 1265000, 1295000, 1320000, 1335000, 1340000, 1345000],
    "3y": [450000, 850000, 1345000, 1950000, 2750000, 3800000],
  },
  networth: {
    "6m": [680000, 750000, 820000, 890000, 960000, 1045000],
    "1y": [380000, 450000, 540000, 620000, 700000, 780000, 840000, 900000, 955000, 1000000, 1025000, 1045000],
    "3y": [120000, 420000, 1045000, 1850000, 2900000, 4200000],
  },
  debt: {
    "6m": [1420000, 1380000, 1320000, 1260000, 1200000, 1150000],
    "1y": [1750000, 1700000, 1640000, 1570000, 1500000, 1440000, 1390000, 1340000, 1290000, 1240000, 1195000, 1150000],
    "3y": [2200000, 1800000, 1150000, 650000, 250000, 0],
  },
  income: {
    "6m": [135000, 135000, 145000, 145000, 150000, 155000],
    "1y": [120000, 125000, 125000, 135000, 135000, 140000, 145000, 145000, 145000, 150000, 152000, 155000],
    "3y": [1200000, 1500000, 1750000, 2100000, 2500000, 3000000],
  },
};

const LABELS: Record<Horizon, string[]> = {
  "6m": ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  "1y": ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  "3y": ["2024", "2025", "2026", "2027\nProj", "2028\nProj", "2029\nProj"],
};

export function ModernMultiMetricChartStudio({ data }: { data: DashboardData }) {
  const { format } = useCurrency();

  const [primary, setPrimary] = useState<MetricId>("payments");
  const [overlay, setOverlay] = useState<MetricId | "none">("investments");
  const [style, setStyle] = useState<ChartStyle>("area");
  const [horizon, setHorizon] = useState<Horizon>("6m");
  const [hovered, setHovered] = useState<number | null>(null);

  const labels = LABELS[horizon];
  const primaryVals = SERIES[primary][horizon];
  const overlayVals = overlay !== "none" ? SERIES[overlay][horizon] : null;

  const primaryMeta = METRICS.find(m => m.id === primary)!;
  const overlayMeta = overlay !== "none" ? METRICS.find(m => m.id === overlay) : null;

  const activeIdx = hovered ?? (labels.length - 1);
  const maxP = Math.max(...primaryVals) || 1;
  const maxO = overlayVals ? Math.max(...overlayVals) || 1 : 1;

  // Insight generation
  const pTrend = primaryVals.length >= 2
    ? ((primaryVals[primaryVals.length - 1] - primaryVals[0]) / primaryVals[0]) * 100
    : 0;
  const trendUp = pTrend >= 0;

  return (
    <div className="card border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">

      {/* Header Row */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-primary)]">
            {primaryMeta.icon} {primaryMeta.label}
            {overlayMeta && <span className="text-[var(--color-text-secondary)]"> vs {overlayMeta.icon} {overlayMeta.label}</span>}
          </p>
          <p className="text-[11px] text-[var(--color-text-secondary)] font-medium mt-0.5">{primaryMeta.description}</p>
        </div>

        {/* Time + Style Controls */}
        <div className="flex items-center gap-2">
          {/* Chart Style */}
          <div className="flex p-0.5 bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] rounded-lg text-xs">
            {(["area", "bar"] as ChartStyle[]).map(s => (
              <button key={s} onClick={() => setStyle(s)}
                className={`px-2.5 py-1 rounded-md font-bold capitalize transition-all cursor-pointer ${
                  style === s ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >{s === "area" ? "📈 Area" : "📊 Bar"}</button>
            ))}
          </div>

          {/* Horizon */}
          <div className="flex p-0.5 bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] rounded-lg text-xs">
            {(["6m", "1y", "3y"] as Horizon[]).map(h => (
              <button key={h} onClick={() => setHorizon(h)}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  horizon === h ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >{h === "3y" ? "3Y Proj" : h.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Selector Row */}
      <div className="px-6 py-3 border-b border-[var(--color-border)] grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Primary */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">Primary Dataset</p>
          <div className="flex flex-wrap gap-1.5">
            {METRICS.map(m => (
              <button key={m.id} onClick={() => setPrimary(m.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                  primary === m.id
                    ? "text-white border-transparent shadow-sm"
                    : "border-[var(--color-border)] text-[var(--color-text-primary)] bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)]"
                }`}
                style={primary === m.id ? { backgroundColor: m.hex, borderColor: m.hex } : {}}
              >
                <span>{m.icon}</span><span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overlay */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">Compare / Overlay</p>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setOverlay("none")}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                overlay === "none"
                  ? "bg-[var(--color-surface-tertiary)] border-[var(--color-text-secondary)] text-[var(--color-text-primary)]"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)]"
              }`}
            >None</button>
            {METRICS.filter(m => m.id !== primary).map(m => (
              <button key={m.id} onClick={() => setOverlay(m.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                  overlay === m.id
                    ? "text-white border-transparent shadow-sm"
                    : "border-[var(--color-border)] text-[var(--color-text-primary)] bg-[var(--color-surface-secondary)] hover:bg-[var(--color-surface-tertiary)]"
                }`}
                style={overlay === m.id ? { backgroundColor: m.hex + "cc", borderColor: m.hex } : {}}
              >
                <span>{m.icon}</span><span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Values Row */}
      <div className="px-6 py-3 border-b border-[var(--color-border)] flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: primaryMeta.hex }} />
          <div>
            <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">{primaryMeta.label} · {labels[activeIdx]}</p>
            <p className="text-lg font-black text-[var(--color-text-primary)]">{format(primaryVals[activeIdx] ?? 0)}</p>
          </div>
        </div>
        {overlayMeta && overlayVals && (
          <>
            <div className="w-px h-10 bg-[var(--color-border)]" />
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full inline-block border-2 border-dashed" style={{ borderColor: overlayMeta.hex, backgroundColor: overlayMeta.hex + "40" }} />
              <div>
                <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">{overlayMeta.label} · {labels[activeIdx]}</p>
                <p className="text-lg font-black text-[var(--color-text-primary)]">{format(overlayVals[activeIdx] ?? 0)}</p>
              </div>
            </div>
          </>
        )}
        <div className="ml-auto flex items-center gap-1.5 text-xs font-bold">
          <span className={trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
            {trendUp ? "▲" : "▼"} {Math.abs(pTrend).toFixed(1)}%
          </span>
          <span className="text-[var(--color-text-secondary)]">over period</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="px-6 py-5">
        {style === "area" ? (
          <div className="space-y-2">
            <div className="relative h-52 w-full">
              <svg className="w-full h-full" viewBox="0 0 600 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={primaryMeta.hex} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={primaryMeta.hex} stopOpacity="0" />
                  </linearGradient>
                  {overlayMeta && (
                    <linearGradient id="og" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={overlayMeta.hex} stopOpacity="0.2" />
                      <stop offset="100%" stopColor={overlayMeta.hex} stopOpacity="0" />
                    </linearGradient>
                  )}
                </defs>

                {/* Horizontal grid lines */}
                {[0.25, 0.5, 0.75].map(pct => (
                  <line key={pct} x1="0" y1={160 * pct} x2="600" y2={160 * pct}
                    stroke="var(--color-border)" strokeDasharray="4 4" opacity="0.5" />
                ))}

                {/* Primary Area + Line */}
                {(() => {
                  const pts = primaryVals.map((v, i) => ({
                    x: (i / (primaryVals.length - 1)) * 580 + 10,
                    y: 155 - (v / maxP) * 130,
                  }));
                  const lineD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                  const areaD = `${lineD} L ${pts[pts.length - 1].x} 165 L ${pts[0].x} 165 Z`;
                  return (
                    <>
                      <path d={areaD} fill="url(#pg)" />
                      <path d={lineD} fill="none" stroke={primaryMeta.hex} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      {pts.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y}
                          r={activeIdx === i ? 6 : 4}
                          fill={activeIdx === i ? primaryMeta.hex : "var(--color-surface)"}
                          stroke={primaryMeta.hex} strokeWidth="2"
                          className="cursor-pointer transition-all duration-150"
                          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                        />
                      ))}
                    </>
                  );
                })()}

                {/* Overlay Area + Line */}
                {overlayMeta && overlayVals && (() => {
                  const pts = overlayVals.map((v, i) => ({
                    x: (i / (overlayVals.length - 1)) * 580 + 10,
                    y: 155 - (v / maxO) * 130,
                  }));
                  const lineD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                  const areaD = `${lineD} L ${pts[pts.length - 1].x} 165 L ${pts[0].x} 165 Z`;
                  return (
                    <>
                      <path d={areaD} fill="url(#og)" />
                      <path d={lineD} fill="none" stroke={overlayMeta.hex} strokeWidth="2" strokeDasharray="6 3" strokeLinecap="round" />
                      {pts.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y}
                          r={activeIdx === i ? 5 : 3.5}
                          fill={activeIdx === i ? overlayMeta.hex : "var(--color-surface)"}
                          stroke={overlayMeta.hex} strokeWidth="2"
                          className="cursor-pointer transition-all duration-150"
                          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                        />
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
            {/* X-axis labels */}
            <div className={`grid text-center`} style={{ gridTemplateColumns: `repeat(${labels.length}, 1fr)` }}>
              {labels.map((l, i) => (
                <span key={l} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                  className={`text-[10px] font-bold cursor-pointer transition-colors leading-tight ${
                    activeIdx === i
                      ? "text-[var(--color-primary-light)]"
                      : "text-[var(--color-text-secondary)]"
                  }`}
                >{l}</span>
              ))}
            </div>
          </div>
        ) : (
          /* Bar Chart */
          <div className="space-y-2">
            <div className="flex items-end gap-1.5 h-52">
              {labels.map((l, i) => {
                const v1 = primaryVals[i] ?? 0;
                const v2 = overlayVals ? overlayVals[i] ?? 0 : null;
                const h1 = Math.max(8, (v1 / maxP) * 100);
                const h2 = v2 !== null ? Math.max(8, (v2 / maxO) * 100) : 0;
                const isActive = activeIdx === i;
                return (
                  <div key={l} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer"
                    onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                    {/* Values on hover */}
                    <div className={`text-[9px] font-black whitespace-nowrap transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                      style={{ color: primaryMeta.hex }}>{format(v1)}</div>

                    {/* Bars */}
                    <div className="w-full flex items-end justify-center gap-0.5 flex-1">
                      <div className="flex-1 rounded-t-md transition-all duration-300"
                        style={{ height: `${h1}%`, backgroundColor: isActive ? primaryMeta.hex : primaryMeta.hex + "bb" }} />
                      {overlayMeta && v2 !== null && (
                        <div className="flex-1 rounded-t-md transition-all duration-300"
                          style={{ height: `${h2}%`, backgroundColor: isActive ? overlayMeta.hex : overlayMeta.hex + "bb" }} />
                      )}
                    </div>

                    <span className={`text-[10px] font-bold leading-tight text-center transition-colors ${
                      isActive ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"
                    }`}>{l}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Insight Footer */}
      <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface-secondary)] flex items-start gap-3">
        <span className="text-base mt-0.5">💡</span>
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-[var(--color-text-primary)] mb-0.5">Analytics Insight</p>
          <p className="text-xs font-medium text-[var(--color-text-secondary)] leading-relaxed">
            {overlayMeta
              ? `Your <strong>${primaryMeta.label}</strong> is ${trendUp ? "growing" : "decreasing"} ${Math.abs(pTrend).toFixed(1)}% over this period while <strong>${overlayMeta.label}</strong> shows a contrasting trajectory. ${
                  primary === "debt" && overlay === "investments"
                    ? "A healthy sign: investments growing faster than debt is a strong wealth-building signal."
                    : primary === "payments" && overlay === "income"
                    ? "Watch that EMI commitments stay well below 40% of income to maintain healthy cashflow."
                    : "Compare how each metric responds to changes in your financial behavior."
                }`
              : `${primaryMeta.label} ${trendUp ? "increased" : "decreased"} by ${Math.abs(pTrend).toFixed(1)}% over the selected period. Peak value: ${format(maxP)}.`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
