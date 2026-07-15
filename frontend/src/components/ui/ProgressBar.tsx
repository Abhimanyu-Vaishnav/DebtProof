/**
 * DebtProof — ProgressBar Component
 */
import React from "react";
import { cn } from "@/utils/cn";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "accent" | "warning" | "error";
  showLabel?: boolean;
  animate?: boolean;
}

const COLOR_CLASSES = {
  primary: "bg-[var(--color-primary)]",
  accent: "bg-[var(--color-accent)]",
  warning: "bg-[var(--color-warning)]",
  error: "bg-[var(--color-error)]",
};

const SIZE_CLASSES = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({
  value,
  className,
  size = "md",
  color = "accent",
  showLabel = false,
  animate = true,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">Progress</span>
          <span className="text-xs font-semibold text-[var(--color-text-primary)]">
            {Math.round(clamped)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-[var(--color-surface-tertiary)] rounded-full overflow-hidden",
          SIZE_CLASSES[size]
        )}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full",
            COLOR_CLASSES[color],
            animate && "transition-all duration-700 ease-out"
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
