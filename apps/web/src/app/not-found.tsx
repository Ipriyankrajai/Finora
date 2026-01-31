"use client";

import { ArrowRight, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Logo } from "@/components/logo";
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
			className={`absolute rounded-full opacity-20 blur-[100px] dark:opacity-30 ${className}`}
			style={{
				animation: "float 15s ease-in-out infinite",
				animationDelay: delay,
			}}
		/>
	);
}

function AnimatedLine({ delay }: { delay: number }) {
	const [width, setWidth] = useState(0);

	useEffect(() => {
		const timer = setTimeout(() => {
			setWidth(100);
		}, delay);
		return () => clearTimeout(timer);
	}, [delay]);

	return (
		<div className="h-px overflow-hidden bg-linear-to-r from-transparent via-foreground/20 to-transparent">
			<div
				className="h-full bg-linear-to-r from-emerald-500/50 via-cyan-500/50 to-emerald-500/50 transition-all duration-1000 ease-out"
				style={{ width: `${width}%` }}
			/>
		</div>
	);
}

export default function NotFound() {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<div className="flex min-h-screen overflow-hidden bg-background">
			{/* Left Side - Branding */}
			<div className="relative hidden overflow-hidden bg-linear-to-br from-background via-card to-background lg:flex lg:w-1/2">
				{/* Animated orbs */}
				<FloatingOrb
					className="-top-20 -left-20 h-96 w-96 bg-emerald-500"
					delay="0s"
				/>
				<FloatingOrb
					className="right-20 bottom-40 h-64 w-64 bg-cyan-500"
					delay="3s"
				/>
				<FloatingOrb
					className="top-1/2 left-1/3 h-48 w-48 bg-emerald-400"
					delay="6s"
				/>

				{/* Gradient mesh overlay */}
				<div
					className="absolute inset-0 opacity-30"
					style={{
						backgroundImage: `radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
                             radial-gradient(circle at 70% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)`,
					}}
				/>

				{/* Grid pattern */}
				<div
					className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
					style={{
						backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                             linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
						backgroundSize: "60px 60px",
					}}
				/>

				{/* Content */}
				<div className="relative z-10 flex w-full flex-col justify-between p-12">
					{/* Top - Logo */}
					<div
						className={`transition-all duration-700 ${mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}
					>
						<Logo />
					</div>

					{/* Center - Main Content */}
					<div className="flex flex-1 items-center">
						<div>
							<div
								className={`transition-all delay-200 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
							>
								<span className="mb-8 inline-block border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] text-emerald-600 uppercase tracking-[0.3em] dark:text-emerald-400/80">
									Page not found
								</span>
							</div>

							<h1
								className={`mb-6 font-extralight text-5xl text-foreground leading-[1.1] tracking-tight transition-all delay-300 duration-700 xl:text-6xl ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
							>
								Looks like you&apos;ve
								<br />
								<span className="shimmer-text font-light">wandered off</span>
							</h1>

							<p
								className={`max-w-md text-base text-muted-foreground leading-relaxed transition-all delay-400 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
							>
								The page you&apos;re looking for doesn&apos;t exist or has been
								moved. Let&apos;s get you back to managing your finances.
							</p>

							<div
								className={`mt-12 transition-all delay-500 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
							>
								<AnimatedLine delay={800} />
							</div>
						</div>
					</div>

					{/* Bottom */}
					<div
						className={`transition-all delay-700 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
					>
						<p className="text-muted-foreground/60 text-xs">
							Error 404 — Page not found
						</p>
					</div>
				</div>
			</div>

			{/* Right Side - Actions */}
			<div className="relative flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
				{/* Subtle gradient background */}
				<div className="absolute inset-0 bg-linear-to-t from-emerald-950/5 via-transparent to-transparent dark:from-emerald-950/10" />

				<div className="relative z-10 w-full max-w-md">
					{/* Mobile logo */}
					<div
						className={`mb-12 transition-all duration-700 lg:hidden ${mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}
					>
						<Logo />
					</div>

					{/* Large 404 */}
					<div
						className={`mb-8 transition-all delay-100 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
					>
						<div className="select-none font-extralight text-[10rem] text-foreground/10 leading-none tracking-tighter md:text-[12rem]">
							404
						</div>
					</div>

					{/* Mobile message */}
					<div
						className={`mb-8 transition-all delay-200 duration-700 lg:hidden ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
					>
						<h1 className="mb-2 font-light text-2xl text-foreground tracking-tight">
							Page not found
						</h1>
						<p className="text-muted-foreground text-sm">
							The page you&apos;re looking for doesn&apos;t exist or has been
							moved.
						</p>
					</div>

					{/* Desktop header */}
					<div
						className={`mb-10 hidden transition-all delay-100 duration-700 lg:block ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
					>
						<h2 className="mb-2 font-light text-2xl text-foreground tracking-tight">
							Let&apos;s get you back
						</h2>
						<p className="text-muted-foreground text-sm">
							Choose where you&apos;d like to go
						</p>
					</div>

					{/* Action buttons */}
					<div
						className={`space-y-4 transition-all delay-300 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
					>
						<Button
							asChild
							className="group relative h-12 w-full overflow-hidden bg-linear-to-r from-emerald-600 to-emerald-500 font-medium text-white transition-all duration-300 hover:from-emerald-500 hover:to-emerald-400"
						>
							<Link href="/">
								<span className="relative z-10 flex items-center justify-center gap-2">
									<Home className="size-4" />
									Back to Home
									<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
								</span>
								<div className="absolute inset-0 bg-linear-to-r from-emerald-400 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
							</Link>
						</Button>

						<Button
							asChild
							className="group h-12 w-full border-border transition-all duration-300 hover:bg-foreground/5"
							variant="outline"
						>
							<Link href="/dashboard">
								<span className="flex items-center justify-center gap-2">
									Go to Dashboard
									<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
								</span>
							</Link>
						</Button>
					</div>

					{/* Divider */}
					<div
						className={`my-8 flex items-center gap-4 transition-all delay-400 duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
					>
						<div className="h-px flex-1 bg-border" />
						<span className="text-muted-foreground/50 text-xs">or</span>
						<div className="h-px flex-1 bg-border" />
					</div>

					{/* Additional help */}
					<div
						className={`text-center transition-all delay-500 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
					>
						<button
							className="group inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
							onClick={() => window.history.back()}
						>
							<RefreshCw className="size-4 transition-transform duration-500 group-hover:-rotate-180" />
							Go back to previous page
						</button>
					</div>

					{/* Suggestions */}
					<div
						className={`mt-12 border border-border/50 bg-card/30 p-6 transition-all delay-600 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
					>
						<h3 className="mb-4 text-muted-foreground text-xs uppercase tracking-wider">
							Popular pages
						</h3>
						<div className="space-y-3">
							<Link
								className="block text-foreground/80 text-sm transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
								href="/#features"
							>
								Features
							</Link>
							<Link
								className="block text-foreground/80 text-sm transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
								href="/pricing"
							>
								Pricing
							</Link>
							<Link
								className="block text-foreground/80 text-sm transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
								href="/about"
							>
								About
							</Link>
						</div>
					</div>

					{/* Footer */}
					<div
						className={`mt-12 text-center transition-all delay-700 duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
					>
						<p className="text-muted-foreground/40 text-xs">
							Need help?{" "}
							<a
								className="text-muted-foreground/60 transition-colors hover:text-muted-foreground"
								href="mailto:support@finora.app"
							>
								Contact Support
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
