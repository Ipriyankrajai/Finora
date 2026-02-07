"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const mockTransactions = [
	{
		name: "Grocery Store",
		amount: "-$84.50",
		tag: "Food",
		color: "bg-emerald-500",
	},
	{
		name: "Electric Bill",
		amount: "-$142.00",
		tag: "Utilities",
		color: "bg-blue-500",
	},
	{
		name: "Coffee Shop",
		amount: "-$5.75",
		tag: "Food",
		color: "bg-emerald-500",
	},
	{
		name: "Salary Deposit",
		amount: "+$3,200.00",
		tag: "Income",
		color: "bg-amber-500",
	},
];

interface StepExpensesProps {
	onNext: () => void;
}

export function StepExpenses({ onNext }: StepExpensesProps) {
	return (
		<div className="flex flex-col items-center text-center">
			<h1 className="mb-3 font-light text-3xl tracking-tight">
				Track Your Spending
			</h1>
			<p className="mb-8 max-w-md text-muted-foreground text-sm leading-relaxed">
				Log every transaction, tag it with categories, and filter by date or
				amount. See exactly where your money goes.
			</p>

			{/* Mock transaction list */}
			<Card className="mb-10 w-full max-w-md">
				<CardContent className="space-y-0 p-0">
					{mockTransactions.map((tx, index) => (
						<div
							className={`flex items-center justify-between px-4 py-3 ${index < mockTransactions.length - 1 ? "border-border border-b" : ""}`}
							key={tx.name}
						>
							<div className="flex items-center gap-3">
								<div className={`size-2 rounded-full ${tx.color}`} />
								<div className="text-left">
									<p className="font-medium text-foreground text-xs">
										{tx.name}
									</p>
									<p className="text-[10px] text-muted-foreground">{tx.tag}</p>
								</div>
							</div>
							<span
								className={`font-medium text-xs ${tx.amount.startsWith("+") ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}
							>
								{tx.amount}
							</span>
						</div>
					))}
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
