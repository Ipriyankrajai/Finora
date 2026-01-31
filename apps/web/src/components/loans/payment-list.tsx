"use client";

import * as React from "react";

import { PaymentRow, type Payment } from "./payment-row";

interface PaymentListProps {
  payments: Payment[];
  onDeletePayment?: (paymentId: string) => void;
}

/**
 * Payment history timeline list.
 * Per CONTEXT.md: "Payment history as timeline list, chronological order"
 * Payments are already sorted by paidAt desc from API (most recent first).
 */
export function PaymentList({ payments, onDeletePayment }: PaymentListProps) {
  if (payments.length === 0) {
    return (
      <div className="text-muted-foreground text-center py-8">
        No payments yet
      </div>
    );
  }

  return (
    <div>
      {payments.map((payment) => (
        <PaymentRow
          key={payment.id}
          payment={payment}
          onDelete={onDeletePayment ? () => onDeletePayment(payment.id) : undefined}
        />
      ))}
    </div>
  );
}
