import { auth } from "@finora2/auth";
import { ArrowRight, PieChart, TrendingUp, Wallet } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
	title: "Finora - Finance Clarity | Personal Finance Management",
	description:
		"Take control of your finances with Finora. Track expenses, manage income, monitor loans, and gain insights into your financial habits through visual analytics.",
	openGraph: {
		title: "Finora - Finance Clarity",
		description:
			"Take control of your finances with Finora. Track expenses, manage income, and gain insights into your financial habits.",
	},
});

import { Button } from "@/components/ui/button";

function FloatingOrb({
	className,
	delay = "0s",
}: {
	className?: string;
	delay?: string;
}) {
	return (
		<div
			className={`absolute rounded-full opacity-15 blur-[100px] dark:opacity-25 ${className}`}
			style={{
				animation: "float 15s ease-in-out infinite",
				animationDelay: delay,
			}}
		/>
	);
}

function GridPattern() {
	return (
		<div className="pointer-events-none absolute inset-0 overflow-hidden">
			<div
				className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
				style={{
					backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
					backgroundSize: "60px 60px",
				}}
			/>
		</div>
	);
}

function FeatureCard({
	icon: Icon,
	title,
	description,
	className,
}: {
	icon: React.ElementType;
	title: string;
	description: string;
	className?: string;
}) {
	return (
		<div
			className={`group fade-in slide-in-from-bottom-4 relative animate-in border border-border/50 bg-card/50 fill-mode-both p-6 backdrop-blur-sm transition-all duration-700 hover:border-primary/30 hover:bg-card ${className}`}
		>
			<div className="absolute inset-0 bg-linear-to-br from-primary/2 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

			<div className="relative">
				<div className="mb-4 inline-flex border border-border/50 p-3 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/5">
					<Icon className="size-5 text-foreground/70 transition-colors duration-300 group-hover:text-primary" />
				</div>

				<h3 className="mb-2 font-semibold text-sm tracking-tight">{title}</h3>
				<p className="text-muted-foreground text-xs leading-relaxed">
					{description}
				</p>
			</div>
		</div>
	);
}

function StatItem({
	value,
	label,
	className,
}: {
	value: string;
	label: string;
	className?: string;
}) {
	return (
		<div
			className={`fade-in animate-in bg-background fill-mode-both p-6 text-center duration-500 ${className}`}
		>
			<div className="mb-1 font-bold text-2xl text-primary tracking-tight md:text-3xl">
				{value}
			</div>
			<div className="text-muted-foreground text-xs uppercase tracking-wider">
				{label}
			</div>
		</div>
	);
}

export default async function HomePage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return (
		<div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
			{/* Background elements */}
			<GridPattern />

			{/* Floating orbs - matching auth pages */}
			<FloatingOrb
				className="-top-40 -left-40 h-[500px] w-[500px] bg-emerald-500"
				delay="0s"
			/>
			<FloatingOrb
				className="top-1/2 -right-40 h-[400px] w-[400px] bg-cyan-500"
				delay="3s"
			/>
			<FloatingOrb
				className="bottom-20 left-1/4 h-[300px] w-[300px] bg-emerald-400"
				delay="6s"
			/>

			{/* Gradient mesh overlay */}
			<div
				className="pointer-events-none absolute inset-0 opacity-30"
				style={{
					backgroundImage: `radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)`,
				}}
			/>

			{/* Main content */}
			<div className="relative z-10 mx-auto max-w-5xl px-6 py-16 md:py-24">
				{/* Hero section */}
				<div className="mb-20 text-center">
					{/* Eyebrow */}
					<div className="fade-in slide-in-from-top-4 mb-8 inline-flex animate-in items-center gap-2 border border-primary/20 bg-primary/5 fill-mode-both px-3 py-1.5 text-primary text-xs tracking-wide duration-700">
						<span className="size-1.5 animate-pulse rounded-full bg-primary" />
						PERSONAL FINANCE CLARITY
					</div>

					{/* Main headline */}
					<h1 className="fade-in slide-in-from-bottom-4 mb-6 animate-in fill-mode-both font-bold text-4xl tracking-tight delay-100 duration-700 md:text-6xl lg:text-7xl">
						<span className="block">Know where your</span>
						<span className="shimmer-text mt-2 block">money goes</span>
					</h1>

					{/* Subheadline */}
					<p className="fade-in slide-in-from-bottom-4 mx-auto mb-10 max-w-xl animate-in fill-mode-both text-base text-muted-foreground leading-relaxed delay-200 duration-700 md:text-lg">
						Track expenses with tags, visualize spending patterns, and see
						exactly when your loans will be paid off.
					</p>

					{/* CTA */}
					<div className="fade-in slide-in-from-bottom-4 flex animate-in flex-col items-center justify-center gap-4 fill-mode-both delay-300 duration-700 sm:flex-row">
						{session ? (
							<Button asChild className="group min-w-[200px]" size="lg">
								<Link href="/dashboard">
									Go to Dashboard
									<ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
								</Link>
							</Button>
						) : (
							<>
								<Button
									asChild
									className="group min-w-[200px] bg-linear-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400"
									size="lg"
								>
									<Link href="/sign-up">
										Get Started
										<ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
									</Link>
								</Button>
								<Button asChild size="lg" variant="outline">
									<Link href="/sign-in">Sign In</Link>
								</Button>
							</>
						)}
					</div>
				</div>

				{/* Stats section */}
				<div className="fade-in slide-in-from-bottom-4 mb-20 grid animate-in grid-cols-3 gap-px border border-border/50 bg-border/50 fill-mode-both delay-500 duration-700">
					<StatItem className="delay-100" label="Privacy First" value="100%" />
					<StatItem className="delay-200" label="Monthly Cost" value="$0" />
					<StatItem className="delay-300" label="Min to Start" value="2" />
				</div>

				{/* Features grid */}
				<div
					className="mb-8 grid gap-px bg-border/30 md:grid-cols-3"
					id="features"
				>
					<FeatureCard
						className="delay-500"
						description="Log income and expenses with custom tags. See exactly where your money flows each month."
						icon={Wallet}
						title="Expense Tracking"
					/>
					<FeatureCard
						className="delay-700"
						description="Beautiful charts show spending breakdowns by category and trends over time."
						icon={PieChart}
						title="Visual Insights"
					/>
					<FeatureCard
						className="delay-1000"
						description="Track loans, simulate extra payments, and see your debt-free date move closer."
						icon={TrendingUp}
						title="Loan Management"
					/>
				</div>

				{/* See all features link */}
				<div className="fade-in mb-20 animate-in fill-mode-both text-center delay-700 duration-500">
					<Link
						className="group inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-primary"
						href="/features"
					>
						See all features
						<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
					</Link>
				</div>

				{/* Bottom CTA */}
				<div className="fade-in animate-in fill-mode-both text-center delay-700 duration-500">
					<div className="inline-flex flex-col items-center border border-primary/30 border-dashed bg-primary/2 p-8">
						<p className="mb-4 text-muted-foreground text-sm">
							Ready to take control of your finances?
						</p>
						{session ? (
							<Button asChild variant="outline">
								<Link href="/dashboard">View Dashboard</Link>
							</Button>
						) : (
							<Button
								asChild
								className="bg-linear-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400"
							>
								<Link href="/sign-up">Create Free Account</Link>
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* Bottom gradient fade */}
			<div className="pointer-events-none absolute right-0 bottom-0 left-0 h-32 bg-linear-to-t from-background to-transparent" />
		</div>
	);
}
