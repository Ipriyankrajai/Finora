"use client";

import { useForm } from "@tanstack/react-form";
import {
	ArrowRight,
	Check,
	Eye,
	EyeOff,
	PieChart,
	TrendingUp,
	Wallet,
} from "lucide-react";
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

function FeatureItem({
	icon: Icon,
	title,
	description,
	delay,
}: {
	icon: React.ElementType;
	title: string;
	description: string;
	delay: number;
}) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), delay);
		return () => clearTimeout(timer);
	}, [delay]);

	return (
		<div
			className={`flex gap-4 transition-all duration-700 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
		>
			<div className="flex size-10 shrink-0 items-center justify-center border border-border bg-foreground/5">
				<Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
			</div>
			<div>
				<h3 className="mb-1 font-medium text-foreground text-sm">{title}</h3>
				<p className="text-muted-foreground text-xs leading-relaxed">
					{description}
				</p>
			</div>
		</div>
	);
}

function PasswordStrength({ password }: { password: string }) {
	const getStrength = () => {
		let score = 0;
		if (password.length >= 8) score++;
		if (password.length >= 12) score++;
		if (/[A-Z]/.test(password)) score++;
		if (/[0-9]/.test(password)) score++;
		if (/[^A-Za-z0-9]/.test(password)) score++;
		return score;
	};

	const strength = getStrength();
	const strengthLabels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
	const strengthColors = [
		"bg-red-500",
		"bg-orange-500",
		"bg-yellow-500",
		"bg-emerald-400",
		"bg-emerald-500",
	];

	if (!password) return null;

	return (
		<div className="mt-3 space-y-2">
			<div className="flex gap-1">
				{[...Array(5)].map((_, i) => (
					<div
						className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? strengthColors[strength - 1] : "bg-foreground/10"}`}
						key={i}
					/>
				))}
			</div>
			<p className="text-muted-foreground text-xs">
				Password strength:{" "}
				<span
					className={`${strength >= 4 ? "text-emerald-600 dark:text-emerald-400" : strength >= 3 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}
				>
					{strengthLabels[strength - 1] || "Very weak"}
				</span>
			</p>
		</div>
	);
}

export default function SignUpPage() {
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
			name: "",
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					onSuccess: () => {
						router.push("/dashboard");
						toast.success("Welcome to Finora!");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				}
			);
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name must be at least 2 characters"),
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
									Get started free
								</span>
							</div>

							<h1
								className={`mb-6 font-extralight text-5xl text-foreground leading-[1.1] tracking-tight transition-all delay-300 duration-700 xl:text-6xl ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
							>
								Take control of
								<br />
								<span className="shimmer-text font-light">your finances</span>
							</h1>

							<p
								className={`max-w-md text-base text-muted-foreground leading-relaxed transition-all delay-400 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
							>
								Join thousands who&apos;ve transformed their financial life with
								clear insights and smart tracking.
							</p>

							{/* Features */}
							<div
								className={`mt-12 space-y-6 transition-all delay-500 duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
							>
								<FeatureItem
									delay={700}
									description="Categorize and tag every transaction for complete visibility"
									icon={Wallet}
									title="Smart Expense Tracking"
								/>
								<FeatureItem
									delay={900}
									description="Stunning charts that reveal your spending patterns"
									icon={PieChart}
									title="Beautiful Analytics"
								/>
								<FeatureItem
									delay={1100}
									description="See your debt-free date and optimize payments"
									icon={TrendingUp}
									title="Loan Payoff Planning"
								/>
							</div>
						</div>
					</div>

					{/* Bottom - Social proof */}
					<div
						className={`transition-all delay-700 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
					>
						<div className="flex items-center gap-3">
							<div className="flex -space-x-2">
								{[...Array(4)].map((_, i) => (
									<div
										className="size-8 rounded-full border-2 border-background bg-linear-to-br from-emerald-400 to-cyan-500"
										key={i}
										style={{
											opacity: 1 - i * 0.15,
										}}
									/>
								))}
							</div>
							<p className="text-muted-foreground text-xs">
								Trusted by{" "}
								<span className="font-medium text-foreground/80">10,000+</span>{" "}
								users
							</p>
						</div>
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
							Create your account
						</h2>
						<p className="text-muted-foreground text-sm">
							Start your journey to financial clarity
						</p>
					</div>

					{/* Form */}
					<form
						className={`space-y-5 transition-all delay-200 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
					>
						<div className="space-y-2">
							<form.Field name="name">
								{(field) => (
									<div className="space-y-2">
										<Label
											className="text-muted-foreground text-xs uppercase tracking-wider"
											htmlFor={field.name}
										>
											Full Name
										</Label>
										<Input
											className="h-12 border-border bg-foreground/5 text-foreground transition-all placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-foreground/[0.07]"
											id={field.name}
											name={field.name}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="John Doe"
											type="text"
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
												placeholder="Create a strong password"
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
										<PasswordStrength password={field.state.value} />
									</div>
								)}
							</form.Field>
						</div>

						{/* Benefits checklist */}
						<div className="space-y-3 py-4">
							{[
								"Free forever, no hidden costs",
								"Bank-level 256-bit encryption",
								"Your data stays private",
							].map((benefit, index) => (
								<div
									className={
										"flex items-center gap-3 transition-all duration-500"
									}
									key={benefit}
									style={{ transitionDelay: `${300 + index * 100}ms` }}
								>
									<div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/10">
										<Check className="size-3 text-emerald-600 dark:text-emerald-400" />
									</div>
									<span className="text-muted-foreground text-xs">
										{benefit}
									</span>
								</div>
							))}
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
												Creating account...
											</>
										) : (
											<>
												Create account
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

					{/* Sign in link */}
					<div
						className={`text-center transition-all delay-400 duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
					>
						<p className="text-muted-foreground text-sm">
							Already have an account?{" "}
							<Link
								className="font-medium text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
								href="/sign-in"
							>
								Sign in
							</Link>
						</p>
					</div>

					{/* Footer */}
					<div
						className={`mt-12 text-center transition-all delay-500 duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
					>
						<p className="text-muted-foreground/40 text-xs">
							By creating an account, you agree to our{" "}
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
