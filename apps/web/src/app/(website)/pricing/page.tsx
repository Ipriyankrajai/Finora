import { ArrowRight, Check, Sparkles } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { getAnimationDelay, getStatDelay } from "@/lib/animation-utils";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
	title: "Pricing",
	description:
		"Simple, transparent pricing for Finora. Start free with unlimited expense tracking, or upgrade to Pro for advanced analytics and premium features.",
	openGraph: {
		title: "Pricing - Finora",
		description:
			"Simple, transparent pricing. Start free with unlimited expense tracking.",
	},
});

import { PageBackground } from "@/components/page-background";
import { Button } from "@/components/ui/button";

const plans = [
	{
		name: "Free",
		description: "Everything you need to track your finances",
		price: "$0",
		period: "forever",
		cta: "Get Started",
		ctaVariant: "outline" as const,
		href: "/sign-up",
		features: [
			"Unlimited expense tracking",
			"Custom tags and categories",
			"Visual spending insights",
			"Loan tracking & simulation",
			"Monthly/yearly reports",
			"Data export (CSV)",
			"Mobile responsive",
			"Bank-level encryption",
		],
		highlighted: false,
	},
	{
		name: "Pro",
		description: "Advanced features for power users",
		price: "$5",
		period: "per month",
		cta: "Coming Soon",
		ctaVariant: "default" as const,
		href: "#",
		features: [
			"Everything in Free",
			"Advanced analytics",
			"Budget forecasting",
			"Multi-currency support",
			"Recurring transactions",
			"Custom reports",
			"Priority support",
			"API access",
		],
		highlighted: true,
		badge: "Popular",
	},
	{
		name: "Family",
		description: "Shared finances made simple",
		price: "$9",
		period: "per month",
		cta: "Coming Soon",
		ctaVariant: "outline" as const,
		href: "#",
		features: [
			"Everything in Pro",
			"Up to 5 family members",
			"Shared budgets",
			"Family dashboard",
			"Spending comparisons",
			"Allowance tracking",
			"Goal sharing",
			"Family reports",
		],
		highlighted: false,
	},
];

const faqs = [
	{
		question: "Is Finora really free?",
		answer:
			"Yes! The Free plan includes everything most people need to track expenses, manage loans, and gain financial insights. We'll never put essential features behind a paywall.",
	},
	{
		question: "What payment methods do you accept?",
		answer:
			"For Pro and Family plans, we accept all major credit cards, debit cards, and PayPal. All payments are processed securely through Stripe.",
	},
	{
		question: "Can I cancel anytime?",
		answer:
			"Absolutely. There are no contracts or commitments. You can upgrade, downgrade, or cancel your subscription at any time from your account settings.",
	},
	{
		question: "Is my financial data secure?",
		answer:
			"Your security is our top priority. We use bank-level 256-bit encryption, never store sensitive credentials, and never sell your data. Your information belongs to you.",
	},
];

export default function PricingPage() {
	return (
		<div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
			<PageBackground variant="centered" />

			{/* Header */}
			<section className="relative z-10 border-border/50 border-b">
				<div className="mx-auto max-w-5xl px-6 py-16 text-center md:py-24">
					<span className="fade-in slide-in-from-top-4 mb-6 inline-flex animate-in border border-primary/20 bg-primary/5 fill-mode-both px-3 py-1.5 text-[10px] text-primary uppercase tracking-[0.3em] duration-700">
						Pricing
					</span>
					<h1 className="fade-in slide-in-from-bottom-4 mb-4 animate-in fill-mode-both font-bold text-4xl tracking-tight delay-100 duration-700 md:text-5xl">
						Simple, transparent pricing
					</h1>
					<p className="fade-in slide-in-from-bottom-4 mx-auto max-w-xl animate-in fill-mode-both text-lg text-muted-foreground delay-200 duration-700">
						Start free, upgrade when you need more. No hidden fees, no
						surprises.
					</p>
				</div>
			</section>

			{/* Plans */}
			<section className="relative z-10 py-16 md:py-24">
				<div className="mx-auto max-w-5xl px-6">
					<div className="grid gap-6 md:grid-cols-3">
						{plans.map((plan, index) => (
							<div
								className={`fade-in slide-in-from-bottom-4 relative flex animate-in flex-col border fill-mode-both p-6 backdrop-blur-sm duration-700 ${
									plan.highlighted
										? "border-primary/50 bg-primary/[0.02]"
										: "border-border/50 bg-card/50"
								} ${getStatDelay(index)}`}
								key={plan.name}
							>
								{plan.badge && (
									<div className="absolute -top-3 left-6">
										<span className="inline-flex items-center gap-1 bg-primary px-3 py-1 font-medium text-primary-foreground text-xs">
											<Sparkles className="size-3" />
											{plan.badge}
										</span>
									</div>
								)}

								<div className="mb-6">
									<h3 className="mb-2 font-semibold text-xl">{plan.name}</h3>
									<p className="text-muted-foreground text-sm">
										{plan.description}
									</p>
								</div>

								<div className="mb-6">
									<span className="font-bold text-4xl">{plan.price}</span>
									<span className="ml-2 text-muted-foreground">
										/{plan.period}
									</span>
								</div>

								<ul className="mb-8 flex-1 space-y-3">
									{plan.features.map((feature) => (
										<li
											className="flex items-start gap-3 text-sm"
											key={feature}
										>
											<Check className="mt-0.5 size-4 shrink-0 text-primary" />
											<span className="text-muted-foreground">{feature}</span>
										</li>
									))}
								</ul>

								<Button
									asChild
									className={`group w-full ${
										plan.highlighted
											? "bg-linear-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400"
											: ""
									}`}
									disabled={plan.href === "#"}
									variant={plan.ctaVariant}
								>
									{plan.href === "#" ? (
										<span>{plan.cta}</span>
									) : (
										<Link href={plan.href as Route}>
											{plan.cta}
											<ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
										</Link>
									)}
								</Button>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section className="relative z-10 border-border/50 border-y bg-card/30 py-16 backdrop-blur-sm md:py-24">
				<div className="mx-auto max-w-3xl px-6">
					<div className="fade-in slide-in-from-bottom-4 mb-12 animate-in fill-mode-both text-center duration-700">
						<h2 className="mb-4 font-bold text-3xl tracking-tight">
							Frequently Asked Questions
						</h2>
						<p className="text-muted-foreground">
							Have questions? We have answers.
						</p>
					</div>

					<div className="space-y-6">
						{faqs.map((faq, index) => (
							<div
								className={`fade-in slide-in-from-bottom-4 animate-in border border-border/50 bg-background/50 fill-mode-both p-6 backdrop-blur-sm duration-700 ${getAnimationDelay(index)}`}
								key={faq.question}
							>
								<h3 className="mb-2 font-semibold">{faq.question}</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{faq.answer}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="relative z-10 py-16 md:py-24">
				<div className="mx-auto max-w-5xl px-6 text-center">
					<h2 className="fade-in mb-4 animate-in fill-mode-both font-bold text-3xl tracking-tight duration-500">
						Ready to take control?
					</h2>
					<p className="fade-in mx-auto mb-8 max-w-md animate-in fill-mode-both text-muted-foreground delay-100 duration-500">
						Start tracking your finances today. It&apos;s free, forever.
					</p>
					<Button
						asChild
						className="group fade-in slide-in-from-bottom-4 animate-in bg-linear-to-r from-emerald-600 to-emerald-500 fill-mode-both text-white delay-200 duration-700 hover:from-emerald-500 hover:to-emerald-400"
						size="lg"
					>
						<Link href="/sign-up">
							Get Started Free
							<ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
						</Link>
					</Button>
				</div>
			</section>

			{/* Bottom gradient fade */}
			<div className="pointer-events-none absolute right-0 bottom-0 left-0 h-32 bg-linear-to-t from-background to-transparent" />
		</div>
	);
}
