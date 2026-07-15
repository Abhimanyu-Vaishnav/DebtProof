/**
 * DebtProof — EmptyState Component
 */
import React from "react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-tertiary)] flex items-center justify-center text-[var(--color-text-tertiary)] mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--color-text-secondary)] max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {(actionLabel && actionHref) && (
        <Link
          href={actionHref}
          className="btn btn-primary btn-sm mt-5"
        >
          {actionLabel}
        </Link>
      )}
      {(actionLabel && onAction && !actionHref) && (
        <button
          onClick={onAction}
          className="btn btn-primary btn-sm mt-5"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
