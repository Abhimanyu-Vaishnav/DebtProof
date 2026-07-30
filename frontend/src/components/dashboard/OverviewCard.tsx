/**
 * DebtProof — Overview Card (KPI) Component v2
 * Minimal, modern stat card for the dashboard overview grid.
 */
import React from "react";
import { cn } from "@/utils/cn";

interface OverviewCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg?: string;
  accentColor?: string; // e.g. "text-indigo-400"
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
    label: string;
  };
  loading?: boolean;
}

export function OverviewCard({
  title,
  value,
  subtitle,
  icon,
  iconBg = "bg-indigo-500/10 text-indigo-400",
  accentColor = "text-[var(--color-text-primary)]",
  trend,
  loading = false,
}: OverviewCardProps) {
  return (
    <article className="kpi-card">
      {/* Top row: icon + trend */}
      <div className="flex items-center justify-between">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
          {icon}
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-full",
              trend.direction === "up"   && "bg-emerald-500/10 text-emerald-400",
              trend.direction === "down" && "bg-red-500/10 text-red-400",
              trend.direction === "neutral" && "bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)]"
            )}
          >
            {trend.direction === "up" && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15" /></svg>
            )}
            {trend.direction === "down" && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            )}
            {trend.value}
          </div>
        )}
      </div>

      {/* Value + labels */}
      {loading ? (
        <div className="space-y-2">
          <div className="skeleton h-7 w-28" />
          <div className="skeleton h-3 w-20" />
        </div>
      ) : (
        <div>
          <p className={cn("kpi-value", accentColor)}>{value}</p>
          <p className="kpi-label mt-1">{title}</p>
          {subtitle && <p className="kpi-sub mt-0.5">{subtitle}</p>}
          {trend && <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">{trend.label}</p>}
        </div>
      )}
    </article>
  );
}
