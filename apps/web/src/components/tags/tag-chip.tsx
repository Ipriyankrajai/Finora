"use client";

import { cn } from "@/lib/utils";

interface TagChipProps {
  name: string;
  color: string;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Compact tag chip with colored dot indicator.
 * Per CONTEXT.md: "compact chips with color dots"
 */
export function TagChip({ name, color, size = "md", className }: TagChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        size === "sm" ? "text-xs" : "text-sm",
        className
      )}
    >
      <span
        className={cn(
          "shrink-0 rounded-full",
          size === "sm" ? "size-2" : "size-2.5"
        )}
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="truncate">{name}</span>
    </span>
  );
}
