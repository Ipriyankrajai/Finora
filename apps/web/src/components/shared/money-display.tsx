"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { formatCents } from "@/lib/format";

interface MoneyDisplayProps {
  cents: bigint | number;
  type?: "INCOME" | "EXPENSE";
  className?: string;
  showSign?: boolean;
}

function MoneyDisplay({
  cents,
  type,
  className,
  showSign = true,
}: MoneyDisplayProps) {
  const numericCents = typeof cents === "bigint" ? Number(cents) : cents;
  const isNegative = numericCents < 0;
  const absoluteCents = Math.abs(numericCents);
  const formatted = formatCents(absoluteCents);

  // Determine sign prefix
  let prefix = "";
  if (showSign) {
    if (type === "INCOME") {
      prefix = "+";
    } else if (type === "EXPENSE") {
      prefix = "-";
    } else if (isNegative) {
      prefix = "-";
    }
  }

  // Determine color based on type
  const colorClass =
    type === "INCOME"
      ? "text-green-600 dark:text-green-500"
      : type === "EXPENSE"
        ? "text-red-600 dark:text-red-500"
        : "";

  return (
    <span
      data-slot="money-display"
      className={cn(
        "tabular-nums",
        colorClass,
        className,
      )}
    >
      {prefix}
      {formatted}
    </span>
  );
}

export { MoneyDisplay };
export type { MoneyDisplayProps };
