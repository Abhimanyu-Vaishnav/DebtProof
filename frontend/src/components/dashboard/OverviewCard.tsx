/**
 * DebtProof — Overview Card Component
 * Statistics card displayed in the dashboard overview grid.
 */
import React from "react";
import { cn } from "@/utils/cn";

interface OverviewCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg?: string;
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
  iconBg = "bg-[var(--color-primary)]",
  trend,
  loading = false,
}: OverviewCardProps) {
  return (
    <article className="overview-card">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className={cn("overview-card-icon text-white", iconBg)}>
          {icon}
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold",
              trend.direction === "up" && "text-[var(--color-success)]",
              trend.direction === "down" && "text-[var(--color-error)]",
              trend.direction === "neutral" && "text-[var(--color-text-tertiary)]"
            )}
          >
            {trend.direction === "up" && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            )}
            {trend.direction === "down" && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
            {trend.value}
          </div>
        )}
      </div>

      {loading ? (
        <>
          <div className="skeleton h-7 w-32 mb-1.5" />
          <div className="skeleton h-4 w-24" />
        </>
      ) : (
        <>
          <p className="text-2xl font-bold text-[var(--color-text-primary)] leading-none mb-1.5 tracking-tight">
            {value}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] font-medium">{title}</p>
          {subtitle && (
            <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{subtitle}</p>
          )}
          {trend && (
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{trend.label}</p>
          )}
        </>
      )}
    </article>
  );
}
