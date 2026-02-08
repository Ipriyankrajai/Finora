"use client";

import {
	type CurrencyCode,
	getCurrencyOptions,
	getOptionLabel,
} from "@finora2/api/lib/currency";
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
} from "@/components/ui/select";
import {
	useUpdateCurrency,
	useUpdateProfile,
	useUserSettings,
} from "@/hooks/use-user-settings";

const profileSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name cannot exceed 100 characters"),
	currencyCode: z.string().min(1, "Please select a currency"),
});

export function ProfileForm() {
	const router = useRouter();
	const { data: settings, isLoading: settingsLoading } = useUserSettings();
	const updateProfile = useUpdateProfile();
	const updateCurrency = useUpdateCurrency();

	const isPending = updateProfile.isPending || updateCurrency.isPending;

	const form = useForm({
		defaultValues: {
			name: settings?.name ?? "",
			currencyCode: settings?.currencyCode ?? "USD",
		},
		onSubmit: async ({ value }) => {
			if (value.name !== settings?.name) {
				await updateProfile.mutateAsync({ name: value.name });
			}
			if (value.currencyCode !== settings?.currencyCode) {
				await updateCurrency.mutateAsync({
					currencyCode: value.currencyCode as CurrencyCode,
				});
			}
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

	const currencyOptions = getCurrencyOptions();

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

			{/* Currency */}
			<form.Field name="currencyCode">
				{(field) => (
					<div className="space-y-2">
						<Label>Currency</Label>
						<Select
							onValueChange={(val) => field.handleChange(val as string)}
							value={field.state.value}
						>
							<SelectTrigger>
								{field.state.value ? (
									getOptionLabel(field.state.value)
								) : (
									<span className="text-muted-foreground">Select currency</span>
								)}
							</SelectTrigger>
							<SelectContent>
								{currencyOptions.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
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
