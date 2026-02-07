"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
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
}

export function StepSetup({
	defaultName = "",
	defaultCurrency = "$",
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
			<h1 className="mb-3 font-light text-3xl tracking-tight">
				Set Up Your Profile
			</h1>
			<p className="mb-8 max-w-md text-muted-foreground text-sm leading-relaxed">
				Almost done! Tell us your name and preferred currency so we can
				personalize your experience.
			</p>

			<form
				className="w-full max-w-md space-y-6"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<form.Field name="name">
					{(field) => (
						<div className="space-y-2 text-left">
							<Label
								className="text-muted-foreground text-xs uppercase tracking-wider"
								htmlFor="setup-name"
							>
								Display Name
							</Label>
							<Input
								className="h-10 border-border bg-foreground/5 text-foreground transition-all placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-foreground/[0.07]"
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
								<p className="text-destructive/80 text-xs" key={error?.message}>
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
								className="text-muted-foreground text-xs uppercase tracking-wider"
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
								<SelectTrigger className="h-10 border-border bg-foreground/5 text-foreground transition-all focus:border-primary/50 focus:bg-foreground/[0.07]">
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
								<p className="text-destructive/80 text-xs" key={error?.message}>
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				<form.Subscribe>
					{(state) => (
						<Button
							className="h-10 w-full gap-2 bg-linear-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400"
							disabled={!state.canSubmit || isSubmitting}
							size="lg"
							type="submit"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="size-4 animate-spin" />
									Finishing setup...
								</>
							) : (
								"Finish Setup"
							)}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}
