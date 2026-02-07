"use client";

import { ArrowRight, PieChart, TrendingUp, Wallet } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

const features = [
	{
		icon: Wallet,
		title: "Track Expenses",
		description: "Categorize and tag every transaction for complete visibility",
	},
	{
		icon: PieChart,
		title: "Visual Insights",
		description: "See where your money goes with clear charts and breakdowns",
	},
	{
		icon: TrendingUp,
		title: "Manage Loans",
		description: "Track balances, log payments, and see your payoff timeline",
	},
];

interface StepWelcomeProps {
	onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
	return (
		<div className="flex flex-col items-center text-center">
			<div className="mb-8">
				<Logo asLink={false} showSubtitle={false} size="lg" />
			</div>

			<h1 className="mb-3 font-light text-3xl tracking-tight">
				Welcome to Finora
			</h1>
			<p className="mb-10 max-w-md text-muted-foreground text-sm leading-relaxed">
				Your personal finance companion. Track spending, manage loans, and see
				exactly where your money goes.
			</p>

			<div className="mb-10 grid w-full max-w-md gap-6">
				{features.map((feature) => (
					<div className="flex items-start gap-4 text-left" key={feature.title}>
						<div className="flex size-10 shrink-0 items-center justify-center border border-border bg-foreground/5">
							<feature.icon className="size-4 text-emerald-600 dark:text-emerald-400" />
						</div>
						<div>
							<h3 className="mb-1 font-medium text-foreground text-sm">
								{feature.title}
							</h3>
							<p className="text-muted-foreground text-xs leading-relaxed">
								{feature.description}
							</p>
						</div>
					</div>
				))}
			</div>

			<Button
				className="h-10 w-full max-w-md gap-2 bg-linear-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400"
				onClick={onNext}
				size="lg"
			>
				Get Started
				<ArrowRight className="size-4" />
			</Button>
		</div>
	);
}
