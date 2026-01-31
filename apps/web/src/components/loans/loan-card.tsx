"use client";

import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { MoneyDisplay } from "@/components/shared/money-display";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
	const paidOff =
		principalNum > 0 ? ((principalNum - balanceNum) / principalNum) * 100 : 0;
	const progressPercent = Math.min(Math.max(paidOff, 0), 100);

	return (
		<Card
			className={cn("cursor-pointer transition-colors", "hover:bg-muted/50")}
			onClick={onClick}
		>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div className="space-y-0.5">
					<p className="text-muted-foreground text-xs uppercase tracking-wider">
						{loan.interestType === "COMPOUND" ? "Compound" : "Simple"}
					</p>
					<h3 className="font-medium leading-none">{loan.name}</h3>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<button
								className="flex size-8 items-center justify-center rounded-sm hover:bg-muted"
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
							<Plus className="mr-2 size-4" />
							Log Payment
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={(e) => {
								e.stopPropagation();
								onEdit();
							}}
						>
							<Pencil className="mr-2 size-4" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={(e) => {
								e.stopPropagation();
								onDelete();
							}}
							variant="destructive"
						>
							<Trash2 className="mr-2 size-4" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Payoff Amount section - what you'd pay today */}
				<div className="space-y-1">
					<p className="text-muted-foreground text-xs">Payoff Amount</p>
					<MoneyDisplay
						cents={loan.payoffAmountCents}
						className="font-semibold text-2xl"
						showSign={false}
					/>
					<p className="text-muted-foreground text-xs">
						Principal:{" "}
						<MoneyDisplay
							cents={loan.balanceCents}
							className="inline"
							showSign={false}
						/>{" "}
						• Interest:{" "}
						<MoneyDisplay
							cents={loan.currentPeriodInterestCents}
							className="inline"
							showSign={false}
						/>
					</p>
				</div>

				{/* Secondary info */}
				<div className="flex items-center gap-4 text-muted-foreground text-xs">
					<span>{loan.annualRatePercent.toFixed(2)}% APR</span>
					<span className="flex items-center gap-1">
						<MoneyDisplay
							cents={loan.monthlyPaymentCents}
							className="text-foreground"
							showSign={false}
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
					<div className="h-2 overflow-hidden rounded-full bg-muted">
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
