"use client";

import { MoneyDisplay } from "@/components/shared/money-display";

interface PaymentSummaryProps {
  payment: {
    principalCents: bigint;
    interestCents: bigint;
  };
  newBalance: bigint;
}

/**
 * Post-payment summary display showing principal/interest split and new balance.
 * Per CONTEXT.md: "Detailed summary showing principal/interest split, new balance"
 */
export function PaymentSummary({ payment, newBalance }: PaymentSummaryProps) {
  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-4">
      <h3 className="font-semibold text-base">Payment Recorded</h3>

      {/* Principal/Interest split */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">To Principal</p>
          <MoneyDisplay
            cents={payment.principalCents}
            className="text-sm font-medium"
            showSign={false}
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">To Interest</p>
          <MoneyDisplay
            cents={payment.interestCents}
            className="text-sm font-medium"
            showSign={false}
          />
        </div>
      </div>

      {/* Divider and new balance */}
      <div className="pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">New Balance</p>
          <MoneyDisplay
            cents={newBalance}
            className="text-xl font-semibold"
            showSign={false}
          />
        </div>
      </div>
    </div>
  );
}
