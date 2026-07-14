/**
 * DebtProof — Card Component
 * Flexible surface card with optional hover and padding variants.
 */
import React, { type ElementType } from "react";
import { cn } from "@/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  as?: ElementType;
  onClick?: () => void;
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-7",
};

export function Card({
  children,
  className,
  hoverable = false,
  padding = "md",
  as: Tag = "div",
  onClick,
}: CardProps) {
  return (
    <Tag
      className={cn("card", hoverable && "card-hover", paddingClasses[padding], className)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-base font-semibold text-[var(--color-text-primary)]", className)}>
      {children}
    </h3>
  );
}
