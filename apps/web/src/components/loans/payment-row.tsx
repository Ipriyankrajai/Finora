"use client";

import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import * as React from "react";

import { MoneyDisplay } from "@/components/shared/money-display";
import { Button } from "@/components/ui/button";

/**
 * Payment data shape from the loan.getById query
 */
export interface Payment {
  id: string;
  amountCents: bigint;
  principalCents: bigint;
  interestCents: bigint;
  isExtra: boolean;
  paidAt: Date;
}

interface PaymentRowProps {
  payment: Payment;
  onDelete?: () => void;
}

/**
 * Individual payment row showing date, principal/interest breakdown, and total amount.
 * Per CONTEXT.md: "Each payment shows principal/interest breakdown inline"
 */
export function PaymentRow({ payment, onDelete }: PaymentRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      {/* Left side - Date and breakdown */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {format(new Date(payment.paidAt), "MMM d, yyyy")}
          </span>
          {payment.isExtra && (
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
              Extra
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          <span>Principal: </span>
          <MoneyDisplay
            cents={payment.principalCents}
            showSign={false}
            className="text-foreground"
          />
          <span> | Interest: </span>
          <MoneyDisplay
            cents={payment.interestCents}
            showSign={false}
            className="text-foreground"
          />
        </div>
      </div>

      {/* Right side - Total and delete */}
      <div className="flex items-center gap-2">
        <MoneyDisplay
          cents={payment.amountCents}
          showSign={false}
          className="text-lg font-medium"
        />
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Delete payment</span>
          </Button>
        )}
      </div>
    </div>
  );
}
