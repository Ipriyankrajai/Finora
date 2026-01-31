"use client";

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
	const principalPercent =
		totalPayment > 0n
			? Math.round(Number((payment.principalCents * 100n) / totalPayment))
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
				<div className="mb-4 space-y-2">
					<div className="flex justify-between text-xs">
						<span className="text-muted-foreground">Payment Breakdown</span>
						<span className="font-medium text-foreground tabular-nums">
							{principalPercent}% to principal
						</span>
					</div>
					<div className="flex h-2.5 overflow-hidden rounded-full bg-muted dark:bg-muted/50">
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
						cents={payment.principalCents}
						label="To Principal"
						variant="primary"
					/>
					<SplitCard
						cents={payment.interestCents}
						label="To Interest"
						variant="secondary"
					/>
				</div>
			</div>

			{/* New balance card */}
			<div className={cn("rounded-lg p-4", "bg-card", "border border-border")}>
				<div className="flex items-center justify-between">
					<div className="space-y-0.5">
						<p className="font-medium text-foreground text-sm">New Balance</p>
						<p className="text-muted-foreground text-xs">Updated just now</p>
					</div>
					<div className="text-right">
						<MoneyDisplay
							cents={newBalance}
							className="font-bold text-2xl text-foreground tracking-tight"
							showSign={false}
						/>
						{newBalance === 0n && (
							<p className="mt-0.5 font-medium text-emerald-600 text-xs dark:text-emerald-400">
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
				"space-y-1 rounded-md p-3",
				"border",
				isPrimary
					? "border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-950/30"
					: "border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/30"
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
				<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
					{label}
				</p>
			</div>
			<MoneyDisplay
				cents={cents}
				className={cn(
					"font-semibold text-lg tabular-nums",
					isPrimary
						? "text-emerald-700 dark:text-emerald-300"
						: "text-amber-700 dark:text-amber-300"
				)}
				showSign={false}
			/>
		</div>
	);
}
