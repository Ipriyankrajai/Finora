"use client";

import { useForm } from "@tanstack/react-form";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

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

function StatCard({
	value,
	label,
	delay,
}: {
	value: string;
	label: string;
	delay: number;
}) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), delay);
		return () => clearTimeout(timer);
	}, [delay]);

	return (
		<div
			className={`text-center transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
		>
			<div className="font-light text-2xl text-foreground/90 tracking-tight">
				{value}
			</div>
			<div className="mt-1 text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
				{label}
			</div>
		</div>
	);
}

export default function SignInPage() {
	const router = useRouter();
	const { isPending, data: session } = authClient.useSession();
	const [mounted, setMounted] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (session && !isPending) {
			router.push("/dashboard");
		}
	}, [session, isPending, router]);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
						router.push("/dashboard");
						toast.success("Welcome back!");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				}
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.string().email("Please enter a valid email"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	if (isPending || session) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="size-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
			</div>
		);
	}

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

					{/* Center - Main headline */}
					<div className="flex flex-1 items-center">
						<div>
							<div
								className={`transition-all delay-200 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
							>
								<span className="mb-8 inline-block border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] text-emerald-600 uppercase tracking-[0.3em] dark:text-emerald-400/80">
									Welcome back
								</span>
							</div>

							<h1
								className={`mb-6 font-extralight text-5xl text-foreground leading-[1.1] tracking-tight transition-all delay-300 duration-700 xl:text-6xl ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
							>
								Your financial
								<br />
								<span className="shimmer-text font-light">clarity awaits</span>
							</h1>

							<p
								className={`max-w-md text-base text-muted-foreground leading-relaxed transition-all delay-400 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
							>
								Pick up where you left off. Your expenses, loans, and insights
								are ready for you.
							</p>

							<div
								className={`mt-12 transition-all delay-500 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
							>
								<AnimatedLine delay={800} />
								<div className="mt-8 grid grid-cols-3 gap-8">
									<StatCard delay={900} label="Encryption" value="256-bit" />
									<StatCard delay={1000} label="Uptime" value="99.9%" />
									<StatCard delay={1100} label="Data sold" value="0" />
								</div>
							</div>
						</div>
					</div>

					{/* Bottom - Trust indicators */}
					<div
						className={`transition-all delay-700 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
					>
						<p className="text-muted-foreground/60 text-xs">
							Your data never leaves your control
						</p>
					</div>
				</div>
			</div>

			{/* Right Side - Form */}
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

					{/* Form header */}
					<div
						className={`mb-10 transition-all delay-100 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
					>
						<h2 className="mb-2 font-light text-2xl text-foreground tracking-tight">
							Sign in
						</h2>
						<p className="text-muted-foreground text-sm">
							Enter your credentials to continue
						</p>
					</div>

					{/* Form */}
					<form
						className={`space-y-6 transition-all delay-200 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
					>
						<div className="space-y-2">
							<form.Field name="email">
								{(field) => (
									<div className="space-y-2">
										<Label
											className="text-muted-foreground text-xs uppercase tracking-wider"
											htmlFor={field.name}
										>
											Email
										</Label>
										<Input
											className="h-12 border-border bg-foreground/5 text-foreground transition-all placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-foreground/[0.07]"
											id={field.name}
											name={field.name}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="you@example.com"
											type="email"
											value={field.state.value}
										/>
										{field.state.meta.errors.map((error) => (
											<p
												className="text-destructive/80 text-xs"
												key={error?.message}
											>
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<div className="space-y-2">
							<form.Field name="password">
								{(field) => (
									<div className="space-y-2">
										<Label
											className="text-muted-foreground text-xs uppercase tracking-wider"
											htmlFor={field.name}
										>
											Password
										</Label>
										<div className="relative">
											<Input
												className="h-12 border-border bg-foreground/5 pr-12 text-foreground transition-all placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-foreground/[0.07]"
												id={field.name}
												name={field.name}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="Enter your password"
												type={showPassword ? "text" : "password"}
												value={field.state.value}
											/>
											<button
												className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
												onClick={() => setShowPassword(!showPassword)}
												type="button"
											>
												{showPassword ? (
													<EyeOff className="size-4" />
												) : (
													<Eye className="size-4" />
												)}
											</button>
										</div>
										{field.state.meta.errors.map((error) => (
											<p
												className="text-destructive/80 text-xs"
												key={error?.message}
											>
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<form.Subscribe>
							{(state) => (
								<Button
									className="group relative h-12 w-full overflow-hidden bg-linear-to-r from-emerald-600 to-emerald-500 font-medium text-white transition-all duration-300 hover:from-emerald-500 hover:to-emerald-400"
									disabled={!state.canSubmit || state.isSubmitting}
									type="submit"
								>
									<span className="relative z-10 flex items-center justify-center gap-2">
										{state.isSubmitting ? (
											<>
												<div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
												Signing in...
											</>
										) : (
											<>
												Sign in
												<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
											</>
										)}
									</span>
									<div className="absolute inset-0 bg-linear-to-r from-emerald-400 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
								</Button>
							)}
						</form.Subscribe>
					</form>

					{/* Divider */}
					<div
						className={`my-8 flex items-center gap-4 transition-all delay-300 duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
					>
						<div className="h-px flex-1 bg-border" />
						<span className="text-muted-foreground/50 text-xs">or</span>
						<div className="h-px flex-1 bg-border" />
					</div>

					{/* Sign up link */}
					<div
						className={`text-center transition-all delay-400 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
					>
						<p className="text-muted-foreground text-sm">
							Don&apos;t have an account?{" "}
							<Link
								className="font-medium text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
								href="/sign-up"
							>
								Create one
							</Link>
						</p>
					</div>

					{/* Footer */}
					<div
						className={`mt-16 text-center transition-all delay-500 duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
					>
						<p className="text-muted-foreground/40 text-xs">
							By signing in, you agree to our{" "}
							<Link
								className="text-muted-foreground/60 hover:text-muted-foreground"
								href="#"
							>
								Terms
							</Link>{" "}
							and{" "}
							<Link
								className="text-muted-foreground/60 hover:text-muted-foreground"
								href="#"
							>
								Privacy Policy
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
