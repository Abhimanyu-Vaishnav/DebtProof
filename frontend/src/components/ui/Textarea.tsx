/**
 * DebtProof — Textarea Component
 */
import React from "react";
import { cn } from "@/utils/cn";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const inputId = id || `textarea-${Math.random().toString(36).slice(2)}`;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {props.required && <span className="text-[var(--color-error)] ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn("form-input resize-none", error && "error", className)}
        rows={props.rows ?? 3}
        {...props}
      />
      {hint && !error && <p className="text-xs text-[var(--color-text-tertiary)]">{hint}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
