/**
 * DebtProof — Badge Component
 */
import React from "react";
import { cn } from "@/utils/cn";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantClass: Record<BadgeVariant, string> = {
  success: "badge badge-success",
  warning: "badge badge-warning",
  error:   "badge badge-error",
  info:    "badge badge-info",
  neutral: "badge badge-neutral",
};

export function Badge({ children, variant = "neutral", className, dot }: BadgeProps) {
  return (
    <span className={cn(variantClass[variant], className)}>
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current inline-block"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
