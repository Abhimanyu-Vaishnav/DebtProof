/**
 * DebtProof — Frontend Utility Functions
 */
import React from "react";

/**
 * Format a number as Indian Rupee currency.
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format a date string to a human-readable format.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Truncate a string to a maximum length.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Get initials from a full name.
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

/**
 * Truncate a blockchain hash for display.
 */
export function truncateHash(hash: string, chars = 8): string {
  if (hash.length <= chars * 2) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

/**
 * Highlight search query matches in a text string.
 */
export function highlightMatch(text: string, search: string): React.ReactNode {
  if (!search) return text;
  const escaped = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return React.createElement(
    React.Fragment,
    null,
    ...parts.map((part, index) =>
      part.toLowerCase() === search.toLowerCase()
        ? React.createElement(
            "mark",
            {
              key: index,
              className: "bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 px-0.5 rounded font-medium",
            },
            part
          )
        : part
    )
  );
}
