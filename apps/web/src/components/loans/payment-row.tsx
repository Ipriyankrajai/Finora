"use client";

import { format } from "date-fns";
import { Trash2 } from "lucide-react";

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
		<div className="flex items-center justify-between border-border border-b py-3 last:border-0">
			{/* Left side - Date and breakdown */}
			<div className="space-y-1">
				<div className="flex items-center gap-2">
					<span className="font-medium text-sm">
						{format(new Date(payment.paidAt), "MMM d, yyyy")}
					</span>
					{payment.isExtra && (
						<span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary text-xs">
							Extra
						</span>
					)}
				</div>
				<div className="text-muted-foreground text-xs">
					<span>Principal: </span>
					<MoneyDisplay
						cents={payment.principalCents}
						className="text-foreground"
						showSign={false}
					/>
					<span> | Interest: </span>
					<MoneyDisplay
						cents={payment.interestCents}
						className="text-foreground"
						showSign={false}
					/>
				</div>
			</div>

			{/* Right side - Total and delete */}
			<div className="flex items-center gap-2">
				<MoneyDisplay
					cents={payment.amountCents}
					className="font-medium text-lg"
					showSign={false}
				/>
				{onDelete && (
					<Button
						className="size-8 p-0 text-muted-foreground hover:text-destructive"
						onClick={(e) => {
							e.stopPropagation();
							onDelete();
						}}
						size="sm"
						variant="ghost"
					>
						<Trash2 className="size-4" />
						<span className="sr-only">Delete payment</span>
					</Button>
				)}
			</div>
		</div>
	);
}
