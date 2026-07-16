/**
 * DebtProof — Select Component
 * Accessible, styled select dropdown matching the design system.
 */
import React from "react";
import { cn } from "@/utils/cn";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function Select({
  label,
  error,
  hint,
  options,
  placeholder,
  onChange,
  className,
  id,
  ...props
}: SelectProps) {
  const reactId = React.useId();
  const inputId = id || reactId;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {props.required && <span className="text-[var(--color-error)] ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          className={cn(
            "form-input appearance-none pr-9 cursor-pointer",
            error && "error",
            className
          )}
          onChange={(e) => onChange?.(e.target.value)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Chevron */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--color-text-tertiary)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
      {hint && !error && (
        <p className="text-xs text-[var(--color-text-tertiary)]">{hint}</p>
      )}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
