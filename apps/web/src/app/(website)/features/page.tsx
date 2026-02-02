import {
	ArrowRight,
	BarChart3,
	Bell,
	Calculator,
	CreditCard,
	FileSpreadsheet,
	Lock,
	PieChart,
	Repeat,
	Shield,
	Smartphone,
	Tags,
	TrendingUp,
	Wallet,
	Zap,
} from "lucide-react";
import Link from "next/link";

import { getAnimationDelay } from "@/lib/animation-utils";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
	title: "Features",
	description:
		"Discover Finora's powerful features: expense tracking, income management, loan monitoring, visual analytics, custom tags, recurring transactions, and more.",
	openGraph: {
		title: "Features - Finora",
		description:
			"Powerful personal finance features: expense tracking, analytics, loan management, and more.",
	},
});

import { PageBackground } from "@/components/page-background";
import { Button } from "@/components/ui/button";

const featureCategories = [
	{
		title: "Expense Tracking",
		description: "Complete visibility into where your money goes",
		icon: Wallet,
		features: [
			{
				icon: Tags,
				title: "Custom Tags & Categories",
				description:
					"Organize transactions your way with unlimited custom tags. Create hierarchies and filter by any combination.",
			},
			{
				icon: Repeat,
				title: "Recurring Transactions",
				description:
					"Set up recurring income and expenses once. Finora automatically logs them so you never miss a payment.",
			},
			{
				icon: CreditCard,
				title: "Multi-Account Support",
				description:
					"Track cash, credit cards, savings, and investments all in one place. Get a complete financial picture.",
			},
		],
	},
	{
		title: "Visual Analytics",
		description: "Beautiful insights that reveal spending patterns",
		icon: PieChart,
		features: [
			{
				icon: BarChart3,
				title: "Interactive Charts",
				description:
					"Explore your finances with dynamic pie charts, bar graphs, and trend lines. Zoom, filter, and drill down into details.",
			},
			{
				icon: TrendingUp,
				title: "Trend Analysis",
				description:
					"See how your spending evolves over time. Identify patterns and catch unusual activity before it becomes a problem.",
			},
			{
				icon: FileSpreadsheet,
				title: "Custom Reports",
				description:
					"Generate detailed reports for any time period. Export to CSV or PDF for tax time or personal records.",
			},
		],
	},
	{
		title: "Loan Management",
		description: "Take control of your debt and see the finish line",
		icon: Calculator,
		features: [
			{
				icon: Calculator,
				title: "Payoff Calculator",
				description:
					"Enter your loan details and see exactly when you'll be debt-free. Simulate extra payments to find the fastest path.",
			},
			{
				icon: TrendingUp,
				title: "Amortization Schedules",
				description:
					"View detailed payment breakdowns showing principal vs. interest over the life of your loan.",
			},
			{
				icon: Zap,
				title: "Acceleration Strategies",
				description:
					"Compare snowball vs. avalanche methods. See how small extra payments can save thousands in interest.",
			},
		],
	},
];

const additionalFeatures = [
	{
		icon: Lock,
		title: "Bank-Level Security",
		description:
			"256-bit encryption protects your data. We never store passwords or sell your information.",
	},
	{
		icon: Smartphone,
		title: "Mobile Optimized",
		description:
			"Full functionality on any device. Track expenses on the go with our responsive design.",
	},
	{
		icon: Bell,
		title: "Smart Notifications",
		description:
			"Get alerts for unusual spending, upcoming bills, and milestone achievements.",
	},
	{
		icon: Shield,
		title: "Privacy First",
		description:
			"Your data belongs to you. We don't share, sell, or monetize your financial information.",
	},
];

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
			className={`group fade-in slide-in-from-bottom-4 relative animate-in border border-border/50 bg-card/50 fill-mode-both p-6 backdrop-blur-sm transition-all duration-700 duration-700 hover:border-primary/30 hover:bg-card ${className}`}
		>
			<div className="absolute inset-0 bg-linear-to-br from-primary/2 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

			<div className="relative">
				<div className="mb-4 inline-flex border border-border/50 p-3 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/5">
					<Icon className="size-5 text-foreground/70 transition-colors duration-300 group-hover:text-primary" />
				</div>

				<h3 className="mb-2 font-semibold text-base tracking-tight">{title}</h3>
				<p className="text-muted-foreground text-sm leading-relaxed">
					{description}
				</p>
			</div>
		</div>
	);
}

function CategorySection({
	category,
	index,
}: {
	category: (typeof featureCategories)[0];
	index: number;
}) {
	const Icon = category.icon;
	const isEven = index % 2 === 0;

	return (
		<section className="relative z-10 py-16 md:py-24">
			<div className="mx-auto max-w-5xl px-6">
				<div
					className={`grid items-start gap-12 md:grid-cols-2 ${
						isEven ? "" : "md:flex-row-reverse"
					}`}
				>
					{/* Category header */}
					<div
						className={`fade-in slide-in-from-bottom-4 animate-in fill-mode-both duration-700 ${isEven ? "" : "md:order-2"}`}
					>
						<div className="sticky top-24">
							<div className="mb-6 inline-flex border border-primary/20 bg-primary/5 p-4">
								<Icon className="size-8 text-primary" />
							</div>
							<h2 className="mb-4 font-bold text-3xl tracking-tight md:text-4xl">
								{category.title}
							</h2>
							<p className="text-lg text-muted-foreground leading-relaxed">
								{category.description}
							</p>
						</div>
					</div>

					{/* Feature cards */}
					<div className={`space-y-4 ${isEven ? "" : "md:order-1"}`}>
						{category.features.map((feature, featureIndex) => (
							<FeatureCard
								className={getAnimationDelay(featureIndex, [
									"delay-100",
									"delay-200",
									"delay-300",
								])}
								description={feature.description}
								icon={feature.icon}
								key={feature.title}
								title={feature.title}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

export default function FeaturesPage() {
	return (
		<div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
			<PageBackground variant="default" />

			{/* Hero */}
			<section className="relative z-10 border-border/50 border-b">
				<div className="mx-auto max-w-5xl px-6 py-16 text-center md:py-24">
					<span className="fade-in slide-in-from-top-4 mb-6 inline-flex animate-in items-center gap-2 border border-primary/20 bg-primary/5 fill-mode-both px-3 py-1.5 text-[10px] text-primary uppercase tracking-[0.3em] duration-700">
						<span className="size-1.5 animate-pulse rounded-full bg-primary" />
						Features
					</span>
					<h1 className="fade-in slide-in-from-bottom-4 mb-6 animate-in fill-mode-both font-bold text-4xl tracking-tight delay-100 duration-700 md:text-5xl lg:text-6xl">
						Everything you need for
						<br />
						<span className="shimmer-text">financial clarity</span>
					</h1>
					<p className="fade-in slide-in-from-bottom-4 mx-auto mb-10 max-w-2xl animate-in fill-mode-both text-lg text-muted-foreground leading-relaxed delay-200 duration-700">
						Powerful tools designed to be simple. Track expenses, visualize
						spending, manage loans, and finally understand where your money
						goes.
					</p>
					<div className="fade-in slide-in-from-bottom-4 flex animate-in flex-col items-center justify-center gap-4 fill-mode-both delay-300 duration-700 sm:flex-row">
						<Button
							asChild
							className="group bg-linear-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400"
							size="lg"
						>
							<Link href="/sign-up">
								Start Free
								<ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
							</Link>
						</Button>
						<Button asChild size="lg" variant="outline">
							<Link href="/pricing">View Pricing</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Feature Categories */}
			{featureCategories.map((category, index) => (
				<div
					className={
						index % 2 === 1
							? "border-border/50 border-y bg-card/30 backdrop-blur-sm"
							: ""
					}
					key={category.title}
				>
					<CategorySection category={category} index={index} />
				</div>
			))}

			{/* Additional Features Grid */}
			<section className="relative z-10 border-border/50 border-y bg-card/30 py-16 backdrop-blur-sm md:py-24">
				<div className="mx-auto max-w-5xl px-6">
					<div className="fade-in slide-in-from-bottom-4 mb-12 animate-in fill-mode-both text-center duration-700">
						<h2 className="mb-4 font-bold text-3xl tracking-tight">
							And so much more
						</h2>
						<p className="mx-auto max-w-xl text-muted-foreground">
							Every feature is designed with your privacy and ease of use in
							mind.
						</p>
					</div>

					<div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
						{additionalFeatures.map((feature, index) => (
							<div
								className={`group fade-in slide-in-from-bottom-4 animate-in border border-border/50 bg-background/50 fill-mode-both p-6 text-center backdrop-blur-sm transition-all duration-700 hover:border-primary/30 ${getAnimationDelay(index)}`}
								key={feature.title}
							>
								<div className="mb-4 inline-flex border border-border/50 p-3 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/5">
									<feature.icon className="size-5 text-primary" />
								</div>
								<h3 className="mb-2 font-semibold text-sm">{feature.title}</h3>
								<p className="text-muted-foreground text-xs leading-relaxed">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="relative z-10 py-16 md:py-24">
				<div className="mx-auto max-w-5xl px-6 text-center">
					<div className="fade-in inline-flex animate-in flex-col items-center border border-primary/30 border-dashed bg-primary/2 fill-mode-both p-12 backdrop-blur-sm duration-500">
						<h2 className="mb-4 font-bold text-3xl tracking-tight">
							Ready to take control?
						</h2>
						<p className="mb-8 max-w-md text-muted-foreground">
							Join thousands who&apos;ve transformed their financial life with
							Finora. It&apos;s free to start.
						</p>
						<div className="flex flex-col items-center gap-4 sm:flex-row">
							<Button
								asChild
								className="group bg-linear-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400"
								size="lg"
							>
								<Link href="/sign-up">
									Create Free Account
									<ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
								</Link>
							</Button>
							<Button asChild size="lg" variant="outline">
								<Link href="/about">Learn More</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Bottom gradient fade */}
			<div className="pointer-events-none absolute right-0 bottom-0 left-0 h-32 bg-linear-to-t from-background to-transparent" />
		</div>
	);
}
