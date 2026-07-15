/**
 * DebtProof — LoadingSpinner Component
 */
import React from "react";
import { cn } from "@/utils/cn";

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  label?: string;
  fullPage?: boolean;
}

const SIZE_CLASSES = {
  xs: "w-3 h-3 border",
  sm: "w-5 h-5 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-3",
};

export function LoadingSpinner({
  size = "md",
  className,
  label = "Loading...",
  fullPage = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={cn(
        "rounded-full border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin",
        SIZE_CLASSES[size],
        className
      )}
      role="status"
      aria-label={label}
    />
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <p className="text-sm text-[var(--color-text-tertiary)]">{label}</p>
        </div>
      </div>
    );
  }

  return spinner;
}
