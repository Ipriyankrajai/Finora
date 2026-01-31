"use client";

import { type Payment, PaymentRow } from "./payment-row";

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
			<div className="py-8 text-center text-muted-foreground">
				No payments yet
			</div>
		);
	}

	return (
		<div>
			{payments.map((payment) => (
				<PaymentRow
					key={payment.id}
					onDelete={
						onDeletePayment ? () => onDeletePayment(payment.id) : undefined
					}
					payment={payment}
				/>
			))}
		</div>
	);
}
