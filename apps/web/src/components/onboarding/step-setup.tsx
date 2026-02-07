"use client";

import { useForm } from "@tanstack/react-form";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useCompleteOnboarding,
	useUpdateCurrency,
	useUpdateProfile,
} from "@/hooks/use-user-settings";
import { CURRENCY_SYMBOLS } from "@/lib/format";

interface StepSetupProps {
	defaultName?: string;
	defaultCurrency?: string;
	onBack: () => void;
}

export function StepSetup({
	defaultName = "",
	defaultCurrency = "$",
	onBack,
}: StepSetupProps) {
	const router = useRouter();
	const updateProfile = useUpdateProfile();
	const updateCurrency = useUpdateCurrency();
	const completeOnboarding = useCompleteOnboarding();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm({
		defaultValues: {
			name: defaultName,
			currencySymbol: defaultCurrency,
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);
			try {
				if (value.name.trim().length >= 2) {
					await updateProfile.mutateAsync({ name: value.name.trim() });
				}
				await updateCurrency.mutateAsync({
					currencySymbol: value.currencySymbol,
				});
				await completeOnboarding.mutateAsync();
				toast.success("You're all set!");
				router.push("/dashboard");
			} catch {
				toast.error("Something went wrong. Please try again.");
				setIsSubmitting(false);
			}
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name must be at least 2 characters"),
				currencySymbol: z.string().min(1).max(3),
			}),
		},
	});

	return (
		<div className="flex flex-col items-center text-center">
			{/* Heading */}
			<div className="onboarding-stagger-1">
				<span className="inline-block border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] text-emerald-600 uppercase tracking-[0.3em] dark:text-emerald-400/80">
					Final Step
				</span>
			</div>

			<h1 className="onboarding-stagger-2 mt-6 mb-3 font-extralight text-3xl text-foreground tracking-tight md:text-4xl">
				Make it{" "}
				<span className="font-light text-emerald-600 dark:text-emerald-400">
					yours
				</span>
			</h1>
			<p className="onboarding-stagger-3 mb-8 max-w-md text-muted-foreground text-sm leading-relaxed">
				Tell us your name and preferred currency. You can always change these
				later in settings.
			</p>

			{/* Form */}
			<form
				className="onboarding-stagger-4 w-full max-w-md"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<div className="mb-8 space-y-5">
					<form.Field name="name">
						{(field) => (
							<div className="space-y-2 text-left">
								<Label
									className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]"
									htmlFor="setup-name"
								>
									Display Name
								</Label>
								<Input
									className="h-11 border-border/50 bg-card/30 text-foreground backdrop-blur-sm transition-all placeholder:text-muted-foreground/40 focus:border-emerald-500/40 focus:bg-card/60"
									disabled={isSubmitting}
									id="setup-name"
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Your name"
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

					<form.Field name="currencySymbol">
						{(field) => (
							<div className="space-y-2 text-left">
								<Label
									className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]"
									htmlFor="setup-currency"
								>
									Currency
								</Label>
								<Select
									disabled={isSubmitting}
									onValueChange={(val) => {
										if (val !== null) {
											field.handleChange(val);
										}
									}}
									value={field.state.value}
								>
									<SelectTrigger className="h-11 border-border/50 bg-card/30 text-foreground backdrop-blur-sm transition-all focus:border-emerald-500/40 focus:bg-card/60">
										<SelectValue placeholder="Select currency" />
									</SelectTrigger>
									<SelectContent>
										{CURRENCY_SYMBOLS.map((currency) => (
											<SelectItem key={currency.value} value={currency.value}>
												{currency.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
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

				{/* Ready checklist */}
				<div className="onboarding-stagger-5 mb-8 border border-border/30 bg-emerald-500/[0.03] p-4">
					<p className="mb-3 text-left text-[10px] text-muted-foreground uppercase tracking-[0.15em]">
						What&apos;s ready for you
					</p>
					<div className="space-y-2.5">
						{[
							"Expense tracking with smart tags",
							"Loan management and payoff planning",
							"Visual analytics and spending insights",
						].map((item) => (
							<div className="flex items-center gap-2.5" key={item}>
								<div className="flex size-4 items-center justify-center bg-emerald-500/10">
									<Check className="size-2.5 text-emerald-600 dark:text-emerald-400" />
								</div>
								<span className="text-left text-foreground/80 text-xs">
									{item}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Actions */}
				<div className="onboarding-stagger-6 flex w-full gap-3">
					<Button
						className="h-11 gap-1.5"
						disabled={isSubmitting}
						onClick={onBack}
						size="lg"
						type="button"
						variant="outline"
					>
						<ArrowLeft className="size-3.5" />
						Back
					</Button>
					<form.Subscribe>
						{(state) => (
							<Button
								className="group relative h-11 flex-1 gap-2 overflow-hidden bg-linear-to-r from-emerald-600 to-emerald-500 font-medium text-white transition-all duration-300 hover:from-emerald-500 hover:to-emerald-400"
								disabled={!state.canSubmit || isSubmitting}
								size="lg"
								type="submit"
							>
								<span className="relative z-10 flex items-center justify-center gap-2">
									{isSubmitting ? (
										<>
											<Loader2 className="size-4 animate-spin" />
											Setting up...
										</>
									) : (
										<>
											Launch Dashboard
											<span className="inline-block transition-transform group-hover:translate-x-0.5">
												&rarr;
											</span>
										</>
									)}
								</span>
								<div className="absolute inset-0 bg-linear-to-r from-emerald-400 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
							</Button>
						)}
					</form.Subscribe>
				</div>
			</form>
		</div>
	);
}
