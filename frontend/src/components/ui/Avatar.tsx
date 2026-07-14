/**
 * DebtProof — Avatar Component
 */
import React from "react";
import { cn } from "@/utils/cn";
import { getInitials } from "@/utils/formatters";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, { outer: string; text: string }> = {
  sm: { outer: "w-7 h-7", text: "text-xs" },
  md: { outer: "w-9 h-9", text: "text-sm" },
  lg: { outer: "w-12 h-12", text: "text-base" },
  xl: { outer: "w-20 h-20", text: "text-xl" },
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const { outer, text } = sizeClasses[size];
  const initials = getInitials(name);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover", outer, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-semibold shrink-0",
        outer,
        text,
        className
      )}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
