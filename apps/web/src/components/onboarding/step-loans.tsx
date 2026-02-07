"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

interface StepLoansProps {
	onNext: () => void;
	onBack: () => void;
}

export function StepLoans({ onNext, onBack }: StepLoansProps) {
	const [barFilled, setBarFilled] = useState(false);
	const [statsVisible, setStatsVisible] = useState(false);

	useEffect(() => {
		const barTimer = setTimeout(() => setBarFilled(true), 600);
		const statsTimer = setTimeout(() => setStatsVisible(true), 900);
		return () => {
			clearTimeout(barTimer);
			clearTimeout(statsTimer);
		};
	}, []);

	const paidPercent = 62;

	return (
		<div className="flex flex-col items-center text-center">
			{/* Heading */}
			<div className="onboarding-stagger-1">
				<span className="inline-block border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] text-emerald-600 uppercase tracking-[0.3em] dark:text-emerald-400/80">
					Loan Management
				</span>
			</div>

			<h1 className="onboarding-stagger-2 mt-6 mb-3 font-extralight text-3xl text-foreground tracking-tight md:text-4xl">
				Debt-free date,{" "}
				<span className="font-light text-emerald-600 dark:text-emerald-400">
					visualized
				</span>
			</h1>
			<p className="onboarding-stagger-3 mb-8 max-w-md text-muted-foreground text-sm leading-relaxed">
				Track loan balances, log payments, run what-if simulations, and see
				exactly when you&apos;ll be debt-free.
			</p>

			{/* Mock loan card */}
			<div className="onboarding-stagger-4 mb-10 w-full max-w-md">
				<div className="border border-border/50 bg-card/30 backdrop-blur-sm">
					{/* Loan header */}
					<div className="flex items-center justify-between border-border/30 border-b px-5 py-4">
						<div className="text-left">
							<p className="font-medium text-foreground text-sm">Car Loan</p>
							<p className="text-[10px] text-muted-foreground">
								5.9% APR &middot; Fixed Rate
							</p>
						</div>
						<div className="text-right">
							<p className="font-medium font-mono text-foreground text-sm">
								$8,420
							</p>
							<p className="text-[10px] text-muted-foreground">remaining</p>
						</div>
					</div>

					{/* Progress visualization */}
					<div className="px-5 py-4">
						{/* Progress bar with animation */}
						<div className="mb-3 h-2 w-full overflow-hidden bg-foreground/5">
							<div
								className="h-full bg-linear-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 ease-out"
								style={{
									width: barFilled ? `${paidPercent}%` : "0%",
								}}
							/>
						</div>
						<div className="flex justify-between text-[10px] text-muted-foreground">
							<span>
								<span className="font-medium text-emerald-600 dark:text-emerald-400">
									{paidPercent}%
								</span>{" "}
								paid off
							</span>
							<span>Est. payoff: Mar 2027</span>
						</div>
					</div>

					{/* Stats row */}
					<div className="grid grid-cols-3 border-border/30 border-t">
						{[
							{ label: "Original", value: "$22,000" },
							{ label: "Monthly", value: "$425" },
							{ label: "Payments", value: "32 / 60" },
						].map((stat, i) => (
							<div
								className={`px-5 py-3 ${i < 2 ? "border-border/30 border-r" : ""} transition-all duration-500 ${
									statsVisible
										? "translate-y-0 opacity-100"
										: "translate-y-2 opacity-0"
								}`}
								key={stat.label}
								style={{
									transitionDelay: `${i * 100}ms`,
								}}
							>
								<p className="text-[10px] text-muted-foreground uppercase tracking-wider">
									{stat.label}
								</p>
								<p className="mt-0.5 font-medium font-mono text-foreground text-xs">
									{stat.value}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* Simulation teaser */}
				<div
					className="mt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground/60"
					style={{
						animation:
							"onboarding-reveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) 1.2s both",
					}}
				>
					<div className="h-px w-8 bg-border" />
					<span className="uppercase tracking-[0.2em]">
						What-if simulations included
					</span>
					<div className="h-px w-8 bg-border" />
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
