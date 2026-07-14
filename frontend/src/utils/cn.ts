/**
 * DebtProof — cn Utility
 * Merges Tailwind class names. Thin wrapper that avoids the need for clsx + tailwind-merge.
 */
export function cn(...classes: (string | undefined | null | false | 0 | 0n)[]): string {
  return classes.filter(Boolean).join(" ");
}
