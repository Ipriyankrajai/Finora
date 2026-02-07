"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod";

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
	useUpdateCurrency,
	useUpdateProfile,
	useUserSettings,
} from "@/hooks/use-user-settings";
import { CURRENCY_SYMBOLS } from "@/lib/format";

/**
 * Validation schema for profile form
 */
const profileSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name cannot exceed 100 characters"),
	currencySymbol: z.string().min(1, "Please select a currency"),
});

/**
 * Profile edit form with name and currency symbol fields.
 * Uses TanStack Form with Zod validation, following transaction-form pattern.
 * Satisfies SETT-01 (update display name) and SETT-02 (set currency symbol).
 */
export function ProfileForm() {
	const router = useRouter();
	const { data: settings, isLoading: settingsLoading } = useUserSettings();
	const updateProfile = useUpdateProfile();
	const updateCurrency = useUpdateCurrency();

	const isPending = updateProfile.isPending || updateCurrency.isPending;

	const form = useForm({
		defaultValues: {
			name: settings?.name ?? "",
			currencySymbol: settings?.currencySymbol ?? "$",
		},
		onSubmit: async ({ value }) => {
			// Update name if changed
			if (value.name !== settings?.name) {
				await updateProfile.mutateAsync({ name: value.name });
			}
			// Update currency if changed
			if (value.currencySymbol !== settings?.currencySymbol) {
				await updateCurrency.mutateAsync({
					currencySymbol: value.currencySymbol,
				});
			}
			// Refresh server-rendered data (sidebar shows name from server session)
			router.refresh();
		},
		validators: {
			onSubmit: profileSchema,
		},
	});

	if (settingsLoading) {
		return (
			<div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
				<Loader2 className="size-4 animate-spin" />
				Loading settings...
			</div>
		);
	}

	return (
		<form
			className="space-y-4"
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			{/* Display Name */}
			<form.Field name="name">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Display Name</Label>
						<Input
							id={field.name}
							name={field.name}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Your name"
							value={field.state.value}
						/>
						{field.state.meta.errors.map((error) => (
							<p className="text-destructive text-xs" key={error?.message}>
								{error?.message}
							</p>
						))}
					</div>
				)}
			</form.Field>

			{/* Currency Symbol */}
			<form.Field name="currencySymbol">
				{(field) => (
					<div className="space-y-2">
						<Label>Currency Symbol</Label>
						<Select
							onValueChange={(val) => field.handleChange(val as string)}
							value={field.state.value}
						>
							<SelectTrigger>
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
							<p className="text-destructive text-xs" key={error?.message}>
								{error?.message}
							</p>
						))}
					</div>
				)}
			</form.Field>

			{/* Submit */}
			<form.Subscribe>
				{(state) => (
					<Button
						disabled={!state.canSubmit || state.isSubmitting || isPending}
						type="submit"
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 size-4 animate-spin" />
								Saving...
							</>
						) : (
							"Save Changes"
						)}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
