"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface StepLoansProps {
	onNext: () => void;
}

export function StepLoans({ onNext }: StepLoansProps) {
	const paidPercent = 62;

	return (
		<div className="flex flex-col items-center text-center">
			<h1 className="mb-3 font-light text-3xl tracking-tight">
				Manage Your Loans
			</h1>
			<p className="mb-8 max-w-md text-muted-foreground text-sm leading-relaxed">
				Track loan balances, log payments, see payoff projections, and run
				what-if simulations to optimize your debt strategy.
			</p>

			{/* Mock loan card */}
			<Card className="mb-10 w-full max-w-md">
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="text-left">
							<p className="font-medium text-foreground text-sm">Car Loan</p>
							<p className="text-muted-foreground text-xs">5.9% APR</p>
						</div>
						<div className="text-right">
							<p className="font-medium text-foreground text-sm">$8,420.00</p>
							<p className="text-muted-foreground text-xs">remaining</p>
						</div>
					</div>

					{/* Progress bar */}
					<div className="space-y-2">
						<div className="h-2 w-full overflow-hidden bg-foreground/5">
							<div
								className="h-full bg-emerald-500 transition-all"
								style={{ width: `${paidPercent}%` }}
							/>
						</div>
						<div className="flex justify-between text-[10px] text-muted-foreground">
							<span>{paidPercent}% paid off</span>
							<span>Est. payoff: Mar 2027</span>
						</div>
					</div>

					{/* Mini stats */}
					<div className="grid grid-cols-3 gap-3 border-border border-t pt-3">
						<div className="text-left">
							<p className="text-[10px] text-muted-foreground">Original</p>
							<p className="font-medium text-foreground text-xs">$22,000</p>
						</div>
						<div className="text-center">
							<p className="text-[10px] text-muted-foreground">Monthly</p>
							<p className="font-medium text-foreground text-xs">$425</p>
						</div>
						<div className="text-right">
							<p className="text-[10px] text-muted-foreground">Payments</p>
							<p className="font-medium text-foreground text-xs">32 of 60</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Button
				className="h-10 w-full max-w-md gap-2 bg-linear-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400"
				onClick={onNext}
				size="lg"
			>
				Next
				<ArrowRight className="size-4" />
			</Button>
		</div>
	);
}
