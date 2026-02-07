"use client";

import {
	ArrowRight,
	BarChart3,
	PieChart,
	TrendingUp,
	Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const features = [
	{
		icon: Wallet,
		title: "Track Expenses",
		description: "Tag, filter, and visualize every transaction",
	},
	{
		icon: PieChart,
		title: "Visual Insights",
		description: "Charts that reveal your spending DNA",
	},
	{
		icon: TrendingUp,
		title: "Manage Loans",
		description: "Payoff timelines and what-if simulations",
	},
	{
		icon: BarChart3,
		title: "Financial Goals",
		description: "Set targets and track your progress",
	},
];

interface StepWelcomeProps {
	onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
	return (
		<div className="flex flex-col items-center text-center">
			{/* Hero badge */}
			<div className="onboarding-stagger-1">
				<span className="inline-block border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] text-emerald-600 uppercase tracking-[0.3em] dark:text-emerald-400/80">
					Let&apos;s get started
				</span>
			</div>

			{/* Headline */}
			<h1 className="onboarding-stagger-2 mt-6 mb-4 font-extralight text-4xl text-foreground leading-[1.1] tracking-tight md:text-5xl">
				Your financial
				<br />
				<span className="shimmer-text font-light">clarity awaits</span>
			</h1>

			{/* Subtitle */}
			<p className="onboarding-stagger-3 mb-12 max-w-md text-muted-foreground text-sm leading-relaxed">
				Finora gives you complete visibility into your money. Track spending,
				manage debt, and make confident financial decisions.
			</p>

			{/* Feature grid */}
			<div className="mb-12 grid w-full max-w-lg grid-cols-2 gap-4">
				{features.map((feature, index) => (
					<div
						className={`group flex items-start gap-3 border border-border/50 bg-card/30 p-4 text-left backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/20 hover:bg-card/60 onboarding-stagger-${index + 3}`}
						key={feature.title}
					>
						<div className="flex size-8 shrink-0 items-center justify-center border border-border/50 bg-foreground/5 transition-colors group-hover:border-emerald-500/30 group-hover:bg-emerald-500/5">
							<feature.icon className="size-3.5 text-muted-foreground transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
						</div>
						<div>
							<h3 className="mb-0.5 font-medium text-foreground text-xs">
								{feature.title}
							</h3>
							<p className="text-[10px] text-muted-foreground leading-relaxed">
								{feature.description}
							</p>
						</div>
					</div>
				))}
			</div>

			{/* CTA */}
			<div className="onboarding-stagger-6 w-full max-w-sm">
				<Button
					className="group relative h-11 w-full gap-2 overflow-hidden bg-linear-to-r from-emerald-600 to-emerald-500 font-medium text-white transition-all duration-300 hover:from-emerald-500 hover:to-emerald-400"
					onClick={onNext}
					size="lg"
				>
					<span className="relative z-10 flex items-center gap-2">
						Begin Setup
						<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
					</span>
					<div className="absolute inset-0 bg-linear-to-r from-emerald-400 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
				</Button>
				<p className="mt-3 text-[10px] text-muted-foreground/50">
					Takes less than 2 minutes
				</p>
			</div>
		</div>
	);
}
