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
 * Celebratory post-payment summary with animations.
 * Shows principal/interest split with satisfying success feedback.
 */
export function PaymentSummary({ payment, newBalance }: PaymentSummaryProps) {
  const totalPayment = payment.principalCents + payment.interestCents;
  const principalPercent = totalPayment > 0n
    ? Math.round(Number(payment.principalCents * 100n / totalPayment))
    : 0;

  return (
    <div className="relative overflow-hidden">
      {/* Sparkle particles */}
      <SparkleField />

      {/* Main card with glass effect */}
      <div
        className={cn(
          "relative rounded-xl p-5",
          "bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-teal-500/10",
          "border border-emerald-500/20",
          "backdrop-blur-sm",
          "animate-in fade-in slide-in-from-bottom-4 duration-500"
        )}
      >
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />

        {/* Success header */}
        <div className="relative flex items-center gap-3 mb-5">
          <div className="relative">
            <div
              className={cn(
                "size-10 rounded-full flex items-center justify-center",
                "bg-gradient-to-br from-emerald-500 to-emerald-600",
                "shadow-lg shadow-emerald-500/30",
                "animate-in zoom-in duration-300"
              )}
              style={{ animationDelay: "150ms" }}
            >
              <CheckIcon className="size-5 text-white animate-in zoom-in duration-200" style={{ animationDelay: "300ms" }} />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" style={{ animationDuration: "1.5s" }} />
          </div>
          <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: "200ms" }}>
            <h3 className="font-semibold text-foreground">Payment Successful</h3>
            <p className="text-xs text-muted-foreground">Your balance has been updated</p>
          </div>
        </div>

        {/* Payment breakdown */}
        <div
          className="relative space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400"
          style={{ animationDelay: "250ms" }}
        >
          {/* Visual progress bar showing split */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Payment Breakdown</span>
              <span className="tabular-nums">{principalPercent}% to principal</span>
            </div>
            <div className="h-2 rounded-full bg-muted/50 overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700 ease-out"
                style={{ width: `${principalPercent}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-amber-500/70 to-amber-400/70 transition-all duration-700 ease-out"
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
              delay="350ms"
            />
            <SplitCard
              label="To Interest"
              cents={payment.interestCents}
              variant="secondary"
              delay="400ms"
            />
          </div>

          {/* Divider with gradient */}
          <div className="relative py-1">
            <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* New balance - the star of the show */}
          <div
            className={cn(
              "relative rounded-lg p-4",
              "bg-gradient-to-br from-card via-card to-muted/30",
              "border border-border/50",
              "animate-in fade-in zoom-in-95 duration-400"
            )}
            style={{ animationDelay: "450ms" }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground font-medium">New Balance</p>
                <p className="text-[10px] text-muted-foreground/70">Updated just now</p>
              </div>
              <div className="text-right">
                <MoneyDisplay
                  cents={newBalance}
                  className="text-2xl font-bold tracking-tight"
                  showSign={false}
                />
                {newBalance === 0n && (
                  <p className="text-xs text-emerald-500 font-medium mt-0.5 animate-pulse">
                    🎉 Paid off!
                  </p>
                )}
              </div>
            </div>
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
  delay
}: {
  label: string;
  cents: bigint;
  variant: "primary" | "secondary";
  delay: string;
}) {
  const isPrimary = variant === "primary";

  return (
    <div
      className={cn(
        "rounded-lg p-3 space-y-1",
        "border transition-colors",
        isPrimary
          ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/30"
          : "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/30",
        "animate-in fade-in slide-in-from-bottom-2 duration-300"
      )}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "size-1.5 rounded-full",
            isPrimary ? "bg-emerald-500" : "bg-amber-500"
          )}
        />
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
          {label}
        </p>
      </div>
      <MoneyDisplay
        cents={cents}
        className={cn(
          "text-lg font-semibold tabular-nums",
          isPrimary ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
        )}
        showSign={false}
      />
    </div>
  );
}

/**
 * Animated sparkle particles for celebration effect
 */
function SparkleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating sparkles */}
      {[...Array(6)].map((_, i) => (
        <Sparkle
          key={i}
          className={cn(
            "absolute text-emerald-400/60",
            i % 2 === 0 ? "text-emerald-400/50" : "text-teal-400/50"
          )}
          style={{
            left: `${15 + i * 15}%`,
            top: `${10 + (i % 3) * 25}%`,
            animationDelay: `${i * 200}ms`,
          }}
          size={6 + (i % 3) * 2}
        />
      ))}
    </div>
  );
}

/**
 * Single sparkle with animation
 */
function Sparkle({
  className,
  style,
  size = 8
}: {
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn(
        "animate-sparkle",
        className
      )}
      style={style}
    >
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}

/**
 * Check icon for success state
 */
function CheckIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
