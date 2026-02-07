"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const mockTransactions = [
	{
		name: "Grocery Store",
		amount: -8450,
		tag: "Food",
		color: "bg-emerald-500",
	},
	{
		name: "Electric Bill",
		amount: -14_200,
		tag: "Utilities",
		color: "bg-blue-500",
	},
	{
		name: "Coffee Shop",
		amount: -575,
		tag: "Food",
		color: "bg-emerald-500",
	},
	{
		name: "Salary Deposit",
		amount: 320_000,
		tag: "Income",
		color: "bg-amber-500",
	},
	{
		name: "Netflix",
		amount: -1599,
		tag: "Subscriptions",
		color: "bg-violet-500",
	},
];

function formatAmount(cents: number): string {
	const abs = Math.abs(cents);
	const dollars = Math.floor(abs / 100);
	const remaining = abs % 100;
	const prefix = cents >= 0 ? "+" : "-";
	return `${prefix}$${dollars.toLocaleString()}.${String(remaining).padStart(2, "0")}`;
}

interface StepExpensesProps {
	onNext: () => void;
	onBack: () => void;
}

export function StepExpenses({ onNext, onBack }: StepExpensesProps) {
	const [visibleRows, setVisibleRows] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setVisibleRows((prev) => {
				if (prev >= mockTransactions.length) {
					clearInterval(timer);
					return prev;
				}
				return prev + 1;
			});
		}, 150);
		return () => clearInterval(timer);
	}, []);

	return (
		<div className="flex flex-col items-center text-center">
			{/* Heading */}
			<div className="onboarding-stagger-1">
				<span className="inline-block border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] text-emerald-600 uppercase tracking-[0.3em] dark:text-emerald-400/80">
					Expense Tracking
				</span>
			</div>

			<h1 className="onboarding-stagger-2 mt-6 mb-3 font-extralight text-3xl text-foreground tracking-tight md:text-4xl">
				Every dollar,{" "}
				<span className="font-light text-emerald-600 dark:text-emerald-400">
					accounted for
				</span>
			</h1>
			<p className="onboarding-stagger-3 mb-8 max-w-md text-muted-foreground text-sm leading-relaxed">
				Log transactions, tag them with categories, and filter by date, amount,
				or type. Complete visibility into your spending.
			</p>

			{/* Mock transaction feed */}
			<div className="onboarding-stagger-4 mb-10 w-full max-w-md">
				<div className="overflow-hidden border border-border/50 bg-card/30 backdrop-blur-sm">
					{/* Header */}
					<div className="flex items-center justify-between border-border/50 border-b px-4 py-2.5">
						<span className="font-medium text-[10px] text-foreground/80 uppercase tracking-[0.15em]">
							Recent Transactions
						</span>
						<span className="text-[10px] text-muted-foreground">5 items</span>
					</div>

					{/* Transaction rows */}
					{mockTransactions.map((tx, index) => (
						<div
							className={`flex items-center justify-between border-border/30 px-4 py-3 transition-all duration-500 ${
								index < mockTransactions.length - 1 ? "border-b" : ""
							} ${
								index < visibleRows
									? "translate-y-0 opacity-100"
									: "translate-y-2 opacity-0"
							}`}
							key={tx.name}
						>
							<div className="flex items-center gap-3">
								<div className={`size-1.5 rounded-full ${tx.color}`} />
								<div className="text-left">
									<p className="font-medium text-foreground text-xs">
										{tx.name}
									</p>
									<p className="text-[10px] text-muted-foreground">{tx.tag}</p>
								</div>
							</div>
							<span
								className={`font-medium font-mono text-xs ${
									tx.amount >= 0
										? "text-emerald-600 dark:text-emerald-400"
										: "text-foreground"
								}`}
							>
								{formatAmount(tx.amount)}
							</span>
						</div>
					))}
				</div>

				{/* Tag pills */}
				<div className="mt-4 flex flex-wrap justify-center gap-2">
					{["Food", "Utilities", "Income", "Subscriptions"].map((tag, i) => (
						<span
							className="border border-border/50 bg-foreground/5 px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:border-emerald-500/30 hover:text-foreground"
							key={tag}
							style={{
								animation: `onboarding-reveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.8 + i * 0.1}s both`,
							}}
						>
							{tag}
						</span>
					))}
				</div>
			</div>

			{/* Navigation */}
			<div className="onboarding-stagger-5 flex w-full max-w-md gap-3">
				<Button
					className="h-11 gap-1.5"
					onClick={onBack}
					size="lg"
					variant="outline"
				>
					<ArrowLeft className="size-3.5" />
					Back
				</Button>
				<Button
					className="group relative h-11 flex-1 gap-2 overflow-hidden bg-linear-to-r from-emerald-600 to-emerald-500 font-medium text-white transition-all duration-300 hover:from-emerald-500 hover:to-emerald-400"
					onClick={onNext}
					size="lg"
				>
					<span className="relative z-10 flex items-center gap-2">
						Continue
						<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
					</span>
					<div className="absolute inset-0 bg-linear-to-r from-emerald-400 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
				</Button>
			</div>
		</div>
	);
}
