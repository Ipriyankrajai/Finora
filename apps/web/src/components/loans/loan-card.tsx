"use client";

import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoneyDisplay } from "@/components/shared/money-display";
import type { LoanWithBalance } from "@/hooks/use-loans";
import { cn } from "@/lib/utils";

interface LoanCardProps {
  loan: LoanWithBalance;
  onEdit: () => void;
  onDelete: () => void;
  onLogPayment: () => void;
  onClick: () => void;
}

/**
 * Individual loan card with balance and progress bar.
 * Per CONTEXT.md: Card-based layout, Balance-focused, Progress bar showing % paid off
 */
export function LoanCard({
  loan,
  onEdit,
  onDelete,
  onLogPayment,
  onClick,
}: LoanCardProps) {
  // Calculate progress (paid off percentage)
  const principalNum = Number(loan.principalCents);
  const balanceNum = Number(loan.balanceCents);
  const paidOff = principalNum > 0
    ? ((principalNum - balanceNum) / principalNum) * 100
    : 0;
  const progressPercent = Math.min(Math.max(paidOff, 0), 100);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors",
        "hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {loan.interestType === "COMPOUND" ? "Compound" : "Simple"}
          </p>
          <h3 className="font-medium leading-none">{loan.name}</h3>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="size-8 rounded-sm flex items-center justify-center hover:bg-muted"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Open menu</span>
              </button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onLogPayment();
              }}
            >
              <Plus className="size-4 mr-2" />
              Log Payment
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="size-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="size-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Payoff Amount section - what you'd pay today */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Payoff Amount</p>
          <MoneyDisplay
            cents={loan.payoffAmountCents}
            className="text-2xl font-semibold"
            showSign={false}
          />
          <p className="text-xs text-muted-foreground">
            Principal: <MoneyDisplay cents={loan.balanceCents} showSign={false} className="inline" /> •{" "}
            Interest: <MoneyDisplay cents={loan.currentPeriodInterestCents} showSign={false} className="inline" />
          </p>
        </div>

        {/* Secondary info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{loan.annualRatePercent.toFixed(2)}% APR</span>
          <span className="flex items-center gap-1">
            <MoneyDisplay
              cents={loan.monthlyPaymentCents}
              showSign={false}
              className="text-foreground"
            />
            /mo
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Paid off</span>
            <span className="font-medium">{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
