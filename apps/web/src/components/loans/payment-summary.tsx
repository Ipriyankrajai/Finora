"use client";

import * as React from "react";
import { MoneyDisplay } from "@/components/shared/money-display";
import { cn } from "@/lib/utils";

interface PaymentSummaryProps {
  payment: {
    principalCents: bigint;
    interestCents: bigint;
  };
  newBalance: bigint;
}

/**
 * Payment summary showing principal/interest split.
 * Clean, readable design that works in light and dark mode.
 */
export function PaymentSummary({ payment, newBalance }: PaymentSummaryProps) {
  const totalPayment = payment.principalCents + payment.interestCents;
  const principalPercent = totalPayment > 0n
    ? Math.round(Number(payment.principalCents * 100n / totalPayment))
    : 0;

  return (
    <div className="space-y-4">
      {/* Payment breakdown card */}
      <div
        className={cn(
          "rounded-lg p-4",
          "bg-muted/30 dark:bg-muted/20",
          "border border-border"
        )}
      >
        {/* Visual progress bar showing split */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Payment Breakdown</span>
            <span className="tabular-nums font-medium text-foreground">
              {principalPercent}% to principal
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-muted dark:bg-muted/50 overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 dark:bg-emerald-400"
              style={{ width: `${principalPercent}%` }}
            />
            <div
              className="h-full bg-amber-500 dark:bg-amber-400"
              style={{ width: `${100 - principalPercent}%` }}
            />
          </div>
        </div>

        {/* Split details */}
        <div className="grid grid-cols-2 gap-3">
          <SplitCard
            label="To Principal"
            cents={payment.principalCents}
            variant="primary"
          />
          <SplitCard
            label="To Interest"
            cents={payment.interestCents}
            variant="secondary"
          />
        </div>
      </div>

      {/* New balance card */}
      <div
        className={cn(
          "rounded-lg p-4",
          "bg-card",
          "border border-border"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">New Balance</p>
            <p className="text-xs text-muted-foreground">Updated just now</p>
          </div>
          <div className="text-right">
            <MoneyDisplay
              cents={newBalance}
              className="text-2xl font-bold tracking-tight text-foreground"
              showSign={false}
            />
            {newBalance === 0n && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                🎉 Paid off!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual split card for principal/interest display
 */
function SplitCard({
  label,
  cents,
  variant,
}: {
  label: string;
  cents: bigint;
  variant: "primary" | "secondary";
}) {
  const isPrimary = variant === "primary";

  return (
    <div
      className={cn(
        "rounded-md p-3 space-y-1",
        "border",
        isPrimary
          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50"
          : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50"
      )}
    >
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "size-2 rounded-full",
            isPrimary
              ? "bg-emerald-500 dark:bg-emerald-400"
              : "bg-amber-500 dark:bg-amber-400"
          )}
        />
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
          {label}
        </p>
      </div>
      <MoneyDisplay
        cents={cents}
        className={cn(
          "text-lg font-semibold tabular-nums",
          isPrimary
            ? "text-emerald-700 dark:text-emerald-300"
            : "text-amber-700 dark:text-amber-300"
        )}
        showSign={false}
      />
    </div>
  );
}
