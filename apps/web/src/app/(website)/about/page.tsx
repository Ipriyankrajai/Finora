import { ArrowRight, Heart, Lock, Sparkles, Target } from "lucide-react";
import Link from "next/link";

import { getAnimationDelay, getStatDelay } from "@/lib/animation-utils";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
	title: "About",
	description:
		"Learn about Finora's mission to bring financial clarity to everyone. We believe in privacy-first, simple, and powerful personal finance tools.",
	openGraph: {
		title: "About Finora",
		description:
			"Learn about Finora's mission to bring financial clarity to everyone.",
	},
});

import { PageBackground } from "@/components/page-background";
import { Button } from "@/components/ui/button";

const values = [
	{
		icon: Lock,
		title: "Privacy First",
		description:
			"Your financial data is yours. We don't sell your data, and we use bank-level encryption to keep it secure.",
	},
	{
		icon: Sparkles,
		title: "Simplicity",
		description:
			"Finance doesn't have to be complicated. We design tools that are powerful yet easy to use.",
	},
	{
		icon: Target,
		title: "Transparency",
		description:
			"No hidden fees, no surprise charges. What you see is what you get, always.",
	},
	{
		icon: Heart,
		title: "User-Centered",
		description:
			"Every feature we build starts with your needs. Your feedback shapes our roadmap.",
	},
];

const stats = [
	{ value: "100%", label: "Free Forever" },
	{ value: "0", label: "Data Sold" },
	{ value: "24/7", label: "Access" },
];

export default function AboutPage() {
	return (
		<div className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
			<PageBackground variant="top-heavy" />

			{/* Hero */}
			<section className="relative z-10 border-border/50 border-b">
				<div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
					<div className="max-w-2xl">
						<span className="fade-in slide-in-from-top-4 mb-6 inline-flex animate-in border border-primary/20 bg-primary/5 fill-mode-both px-3 py-1.5 text-[10px] text-primary uppercase tracking-[0.3em] duration-700">
							About Us
						</span>
						<h1 className="fade-in slide-in-from-bottom-4 mb-6 animate-in fill-mode-both font-bold text-4xl tracking-tight delay-100 duration-700 md:text-5xl">
							Financial clarity for{" "}
							<span className="shimmer-text">everyone</span>
						</h1>
						<p className="fade-in slide-in-from-bottom-4 animate-in fill-mode-both text-lg text-muted-foreground leading-relaxed delay-200 duration-700">
							Finora was built with a simple belief: understanding your money
							should be easy, private, and free. We&apos;re on a mission to help
							millions achieve financial peace of mind.
						</p>
					</div>
				</div>
			</section>

			{/* Stats */}
			<section className="relative z-10 border-border/50 border-b backdrop-blur-sm">
				<div className="mx-auto max-w-5xl px-6">
					<div className="grid grid-cols-3 divide-x divide-border/50">
						{stats.map((stat, index) => (
							<div
								className={`fade-in slide-in-from-bottom-4 animate-in fill-mode-both py-12 text-center duration-700 ${getStatDelay(index)}`}
								key={stat.label}
							>
								<div className="mb-2 font-bold text-3xl text-primary md:text-4xl">
									{stat.value}
								</div>
								<div className="text-muted-foreground text-sm uppercase tracking-wider">
									{stat.label}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Story */}
			<section className="relative z-10 py-16 md:py-24">
				<div className="mx-auto max-w-5xl px-6">
					<div className="grid items-center gap-12 md:grid-cols-2">
						<div className="fade-in slide-in-from-left-8 animate-in fill-mode-both delay-300 duration-700">
							<h2 className="mb-6 font-bold text-3xl tracking-tight">
								Our Story
							</h2>
							<div className="space-y-4 text-muted-foreground">
								<p>
									Finora started from a simple frustration: existing finance
									apps were either too complex, too expensive, or too invasive
									with user data.
								</p>
								<p>
									We believed there had to be a better way. A tool that gives
									you complete visibility into your finances without requiring a
									finance degree to use, and without selling your data to
									advertisers.
								</p>
								<p>
									Today, Finora helps people track expenses, manage loans, and
									visualize their financial journey—all while keeping their data
									completely private.
								</p>
							</div>
						</div>
						<div className="fade-in slide-in-from-right-8 relative animate-in fill-mode-both delay-500 duration-700">
							<div className="flex aspect-square items-center justify-center border border-border/50 bg-linear-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-sm">
								<div className="p-8 text-center">
									<div className="shimmer-text mb-4 font-bold text-7xl">F</div>
									<div className="text-muted-foreground text-sm uppercase tracking-wider">
										Built for clarity
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Values */}
			<section className="relative z-10 border-border/50 border-y bg-card/30 py-16 backdrop-blur-sm md:py-24">
				<div className="mx-auto max-w-5xl px-6">
					<div className="fade-in slide-in-from-bottom-4 mb-12 animate-in fill-mode-both text-center duration-700">
						<h2 className="mb-4 font-bold text-3xl tracking-tight">
							Our Values
						</h2>
						<p className="mx-auto max-w-xl text-muted-foreground">
							These principles guide everything we do at Finora.
						</p>
					</div>

					<div className="grid gap-6 sm:grid-cols-2">
						{values.map((value, index) => (
							<div
								className={`group fade-in slide-in-from-bottom-4 animate-in border border-border/50 bg-background/50 fill-mode-both p-6 backdrop-blur-sm transition-all duration-700 hover:border-primary/30 hover:bg-card ${getAnimationDelay(index)}`}
								key={value.title}
							>
								<div className="mb-4 inline-flex border border-border/50 p-3 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/5">
									<value.icon className="size-5 text-primary" />
								</div>
								<h3 className="mb-2 font-semibold text-lg">{value.title}</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{value.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="relative z-10 py-16 md:py-24">
				<div className="mx-auto max-w-5xl px-6">
					<div className="fade-in animate-in fill-mode-both text-center duration-500">
						<h2 className="mb-4 font-bold text-3xl tracking-tight">
							Ready to get started?
						</h2>
						<p className="mx-auto mb-8 max-w-md text-muted-foreground">
							Join thousands of people who have taken control of their finances
							with Finora.
						</p>
						<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
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
								<Link href="/pricing">View Pricing</Link>
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
