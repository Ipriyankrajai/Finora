"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { RecurringRuleData } from "@/hooks/use-recurring";
import {
	useCreateRecurringRule,
	useUpdateRecurringRule,
} from "@/hooks/use-recurring";
import { useUserSettings } from "@/hooks/use-user-settings";
import { cn } from "@/lib/utils";

import { TagMultiSelect } from "../transactions/tag-multi-select";

// Top-level regex patterns
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;
const DECIMAL_INPUT_PATTERN = /^\d*\.?\d{0,2}$/;
const WHOLE_NUMBER_PATTERN = /^\d+$/;

/**
 * Frequency options for the select dropdown
 */
const FREQUENCY_OPTIONS = [
	{ value: "DAILY", label: "Daily" },
	{ value: "WEEKLY", label: "Weekly" },
	{ value: "BIWEEKLY", label: "Every 2 weeks" },
	{ value: "MONTHLY", label: "Monthly" },
	{ value: "YEARLY", label: "Yearly" },
] as const;

/**
 * Day of week options (0=Sunday to 6=Saturday)
 */
const DAY_OF_WEEK_OPTIONS = [
	{ value: "0", label: "Sunday" },
	{ value: "1", label: "Monday" },
	{ value: "2", label: "Tuesday" },
	{ value: "3", label: "Wednesday" },
	{ value: "4", label: "Thursday" },
	{ value: "5", label: "Friday" },
	{ value: "6", label: "Saturday" },
] as const;

type EndCondition = "forever" | "endDate" | "maxOccurrences";

/**
 * Validation schema for recurring rule form
 */
const recurringFormSchema = z.object({
	type: z.enum(["INCOME", "EXPENSE"]),
	description: z
		.string()
		.max(500, "Description must be 500 characters or less"),
	amount: z
		.string()
		.min(1, "Amount is required")
		.refine((val) => AMOUNT_PATTERN.test(val), "Enter a valid amount")
		.refine((val) => Number.parseFloat(val) > 0, "Amount must be positive")
		.refine(
			(val) => Number.parseFloat(val) <= 999_999_999.99,
			"Amount too large"
		),
	frequency: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY"]),
	dayOfWeek: z.string(),
	dayOfMonth: z.string(),
	startDate: z.date({ message: "Start date is required" }),
	endCondition: z.enum(["forever", "endDate", "maxOccurrences"]),
	endDate: z.union([z.date(), z.undefined()]),
	maxOccurrences: z.string(),
	tagIds: z.array(z.string()),
});

interface RecurringFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editingRule?: RecurringRuleData | null;
}

/**
 * Builds the mutation input from form values.
 * Extracted to reduce cognitive complexity of onSubmit handler.
 */
function buildCreateInput(value: z.infer<typeof recurringFormSchema>) {
	const input: {
		type: "INCOME" | "EXPENSE";
		amount: string;
		description: string | null;
		frequency: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";
		dayOfWeek?: number;
		dayOfMonth?: number;
		startDate: Date;
		endDate?: Date;
		maxOccurrences?: number;
		tagIds?: string[];
	} = {
		type: value.type,
		amount: value.amount,
		description: value.description || null,
		frequency: value.frequency,
		startDate: value.startDate,
	};

	if (value.frequency === "WEEKLY" || value.frequency === "BIWEEKLY") {
		input.dayOfWeek = Number.parseInt(value.dayOfWeek, 10);
	}

	if (value.frequency === "MONTHLY") {
		const dom = Number.parseInt(value.dayOfMonth, 10);
		if (!Number.isNaN(dom)) {
			input.dayOfMonth = dom;
		}
	}

	if (value.endCondition === "endDate" && value.endDate) {
		input.endDate = value.endDate;
	}

	if (value.endCondition === "maxOccurrences" && value.maxOccurrences) {
		const parsed = Number.parseInt(value.maxOccurrences, 10);
		if (!Number.isNaN(parsed) && parsed > 0) {
			input.maxOccurrences = parsed;
		}
	}

	if (value.tagIds.length > 0) {
		input.tagIds = value.tagIds;
	}

	return input;
}

/**
 * Builds the update mutation input from form values.
 */
function buildUpdateInput(
	id: string,
	value: z.infer<typeof recurringFormSchema>
) {
	const input: {
		id: string;
		type: "INCOME" | "EXPENSE";
		amount: string;
		description: string | null;
		frequency: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";
		dayOfWeek?: number;
		dayOfMonth?: number;
		startDate: Date;
		endDate?: Date | null;
		maxOccurrences?: number | null;
		tagIds: string[];
	} = {
		id,
		type: value.type,
		amount: value.amount,
		description: value.description || null,
		frequency: value.frequency,
		startDate: value.startDate,
		tagIds: value.tagIds,
	};

	if (value.frequency === "WEEKLY" || value.frequency === "BIWEEKLY") {
		input.dayOfWeek = Number.parseInt(value.dayOfWeek, 10);
	}

	if (value.frequency === "MONTHLY") {
		const dom = Number.parseInt(value.dayOfMonth, 10);
		if (!Number.isNaN(dom)) {
			input.dayOfMonth = dom;
		}
	}

	if (value.endCondition === "endDate" && value.endDate) {
		input.endDate = value.endDate;
	} else {
		input.endDate = null;
	}

	if (value.endCondition === "maxOccurrences" && value.maxOccurrences) {
		const parsed = Number.parseInt(value.maxOccurrences, 10);
		if (!Number.isNaN(parsed) && parsed > 0) {
			input.maxOccurrences = parsed;
		} else {
			input.maxOccurrences = null;
		}
	} else {
		input.maxOccurrences = null;
	}

	return input;
}

/**
 * Determines the initial end condition from an existing rule
 */
function getInitialEndCondition(rule?: RecurringRuleData | null): EndCondition {
	if (!rule) {
		return "forever";
	}
	if (rule.endDate) {
		return "endDate";
	}
	if (rule.maxOccurrences) {
		return "maxOccurrences";
	}
	return "forever";
}

/**
 * Recurring rule create/edit form in a dialog.
 * Supports frequency-specific fields and end condition selection.
 */
export function RecurringForm({
	open,
	onOpenChange,
	editingRule,
}: RecurringFormProps) {
	const { data: settings } = useUserSettings();
	const currencySymbol = settings?.currencySymbol ?? "$";
	const createRule = useCreateRecurringRule();
	const updateRule = useUpdateRecurringRule();

	const isEditing = !!editingRule;
	const isPending = createRule.isPending || updateRule.isPending;

	// Convert amountCents (BigInt) to display string
	const getInitialAmount = () => {
		if (!editingRule) {
			return "";
		}
		const cents = Number(editingRule.amountCents);
		return (cents / 100).toFixed(2);
	};

	const form = useForm({
		defaultValues: {
			type: (editingRule?.type ?? "EXPENSE") as "INCOME" | "EXPENSE",
			description: editingRule?.description ?? "",
			amount: getInitialAmount(),
			frequency: (editingRule?.frequency ?? "MONTHLY") as
				| "DAILY"
				| "WEEKLY"
				| "BIWEEKLY"
				| "MONTHLY"
				| "YEARLY",
			dayOfWeek: String(editingRule?.dayOfWeek ?? 1),
			dayOfMonth: String(editingRule?.dayOfMonth ?? new Date().getDate()),
			startDate: editingRule?.startDate ?? new Date(),
			endCondition: getInitialEndCondition(editingRule) as EndCondition,
			endDate: editingRule?.endDate ?? undefined,
			maxOccurrences: editingRule?.maxOccurrences?.toString() ?? "",
			tagIds: editingRule?.tags.map((t) => t.tag.id) ?? [],
		},
		onSubmit: async ({ value }) => {
			if (isEditing && editingRule) {
				await updateRule.mutateAsync(buildUpdateInput(editingRule.id, value));
			} else {
				await createRule.mutateAsync(buildCreateInput(value));
			}
			onOpenChange(false);
		},
		validators: {
			onSubmit: recurringFormSchema,
		},
	});

	// Reset form when dialog opens
	const handleOpenChange = (newOpen: boolean) => {
		if (newOpen) {
			form.reset();
			form.setFieldValue("type", editingRule?.type ?? "EXPENSE");
			form.setFieldValue("description", editingRule?.description ?? "");
			form.setFieldValue("amount", getInitialAmount());
			form.setFieldValue("frequency", editingRule?.frequency ?? "MONTHLY");
			form.setFieldValue("dayOfWeek", String(editingRule?.dayOfWeek ?? 1));
			form.setFieldValue(
				"dayOfMonth",
				String(editingRule?.dayOfMonth ?? new Date().getDate())
			);
			form.setFieldValue("startDate", editingRule?.startDate ?? new Date());
			form.setFieldValue("endCondition", getInitialEndCondition(editingRule));
			form.setFieldValue("endDate", editingRule?.endDate ?? undefined);
			form.setFieldValue(
				"maxOccurrences",
				editingRule?.maxOccurrences?.toString() ?? ""
			);
			form.setFieldValue(
				"tagIds",
				editingRule?.tags.map((t) => t.tag.id) ?? []
			);
		}
		onOpenChange(newOpen);
	};

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Edit Recurring Rule" : "Create Recurring Rule"}
					</DialogTitle>
				</DialogHeader>

				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					{/* Type toggle - Income/Expense */}
					<form.Field name="type">
						{(field) => (
							<div className="space-y-2">
								<Label>Type</Label>
								<div className="flex overflow-hidden rounded-none border border-border">
									<button
										className={cn(
											"flex-1 px-4 py-2 font-medium text-sm transition-colors",
											field.state.value === "INCOME"
												? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
												: "bg-transparent text-muted-foreground hover:bg-muted"
										)}
										onClick={() => field.handleChange("INCOME")}
										type="button"
									>
										Income
									</button>
									<button
										className={cn(
											"flex-1 border-border border-l px-4 py-2 font-medium text-sm transition-colors",
											field.state.value === "EXPENSE"
												? "bg-red-500/10 text-red-600 dark:text-red-400"
												: "bg-transparent text-muted-foreground hover:bg-muted"
										)}
										onClick={() => field.handleChange("EXPENSE")}
										type="button"
									>
										Expense
									</button>
								</div>
							</div>
						)}
					</form.Field>

					{/* Description */}
					<form.Field name="description">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									Description{" "}
									<span className="text-muted-foreground">(optional)</span>
								</Label>
								<Input
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="e.g., Netflix subscription"
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

					{/* Amount input */}
					<form.Field name="amount">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Amount</Label>
								<div className="relative">
									<span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground text-xs">
										{currencySymbol}
									</span>
									<Input
										className="pl-6"
										id={field.name}
										inputMode="decimal"
										name={field.name}
										onBlur={field.handleBlur}
										onChange={(e) => {
											const val = e.target.value;
											if (val === "" || DECIMAL_INPUT_PATTERN.test(val)) {
												field.handleChange(val);
											}
										}}
										placeholder="0.00"
										type="text"
										value={field.state.value}
									/>
								</div>
								{field.state.meta.errors.map((error) => (
									<p className="text-destructive text-xs" key={error?.message}>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>

					{/* Frequency select */}
					<form.Field name="frequency">
						{(field) => (
							<div className="space-y-2">
								<Label>Frequency</Label>
								<Select
									onValueChange={(value) =>
										field.handleChange(
											value as
												| "DAILY"
												| "WEEKLY"
												| "BIWEEKLY"
												| "MONTHLY"
												| "YEARLY"
										)
									}
									value={field.state.value}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select frequency" />
									</SelectTrigger>
									<SelectContent>
										{FREQUENCY_OPTIONS.map((opt) => (
											<SelectItem key={opt.value} value={opt.value}>
												{opt.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</form.Field>

					{/* Day of Week - only for WEEKLY/BIWEEKLY */}
					<form.Subscribe selector={(state) => state.values.frequency}>
						{(frequency) =>
							(frequency === "WEEKLY" || frequency === "BIWEEKLY") && (
								<form.Field name="dayOfWeek">
									{(field) => (
										<div className="space-y-2">
											<Label>Day of Week</Label>
											<Select
												onValueChange={(value) =>
													field.handleChange(String(value))
												}
												value={field.state.value}
											>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Select day" />
												</SelectTrigger>
												<SelectContent>
													{DAY_OF_WEEK_OPTIONS.map((opt) => (
														<SelectItem key={opt.value} value={opt.value}>
															{opt.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									)}
								</form.Field>
							)
						}
					</form.Subscribe>

					{/* Day of Month - only for MONTHLY */}
					<form.Subscribe selector={(state) => state.values.frequency}>
						{(frequency) =>
							frequency === "MONTHLY" && (
								<form.Field name="dayOfMonth">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor="dayOfMonth">Day of Month</Label>
											<Input
												id="dayOfMonth"
												inputMode="numeric"
												max={31}
												min={1}
												onBlur={field.handleBlur}
												onChange={(e) => {
													const val = e.target.value;
													if (val === "" || WHOLE_NUMBER_PATTERN.test(val)) {
														field.handleChange(val);
													}
												}}
												placeholder="1-31"
												type="text"
												value={field.state.value}
											/>
											<p className="text-muted-foreground text-xs">
												If the month has fewer days, the last day is used
											</p>
										</div>
									)}
								</form.Field>
							)
						}
					</form.Subscribe>

					{/* Start Date */}
					<form.Field name="startDate">
						{(field) => (
							<div className="space-y-2">
								<Label>Start Date</Label>
								<DatePicker
									className="w-full"
									onChange={(date) => field.handleChange(date ?? new Date())}
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

					{/* End Condition */}
					<form.Field name="endCondition">
						{(field) => (
							<div className="space-y-2">
								<Label>End Condition</Label>
								<div className="space-y-2">
									<label className="flex cursor-pointer items-center gap-2">
										<input
											checked={field.state.value === "forever"}
											className="accent-primary"
											name="endCondition"
											onChange={() => field.handleChange("forever")}
											type="radio"
											value="forever"
										/>
										<span className="text-sm">Run forever</span>
									</label>
									<label className="flex cursor-pointer items-center gap-2">
										<input
											checked={field.state.value === "endDate"}
											className="accent-primary"
											name="endCondition"
											onChange={() => field.handleChange("endDate")}
											type="radio"
											value="endDate"
										/>
										<span className="text-sm">End on date</span>
									</label>
									<label className="flex cursor-pointer items-center gap-2">
										<input
											checked={field.state.value === "maxOccurrences"}
											className="accent-primary"
											name="endCondition"
											onChange={() => field.handleChange("maxOccurrences")}
											type="radio"
											value="maxOccurrences"
										/>
										<span className="text-sm">After N occurrences</span>
									</label>
								</div>
							</div>
						)}
					</form.Field>

					{/* End Date picker - shown when endCondition is "endDate" */}
					<form.Subscribe selector={(state) => state.values.endCondition}>
						{(endCondition) =>
							endCondition === "endDate" && (
								<form.Field name="endDate">
									{(field) => (
										<div className="space-y-2">
											<Label>End Date</Label>
											<DatePicker
												className="w-full"
												onChange={(date) =>
													field.handleChange(date ?? undefined)
												}
												value={field.state.value}
											/>
										</div>
									)}
								</form.Field>
							)
						}
					</form.Subscribe>

					{/* Max Occurrences - shown when endCondition is "maxOccurrences" */}
					<form.Subscribe selector={(state) => state.values.endCondition}>
						{(endCondition) =>
							endCondition === "maxOccurrences" && (
								<form.Field name="maxOccurrences">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor="maxOccurrences">
												Number of Occurrences
											</Label>
											<Input
												id="maxOccurrences"
												inputMode="numeric"
												min={1}
												onBlur={field.handleBlur}
												onChange={(e) => {
													const val = e.target.value;
													if (val === "" || WHOLE_NUMBER_PATTERN.test(val)) {
														field.handleChange(val);
													}
												}}
												placeholder="e.g., 12"
												type="text"
												value={field.state.value}
											/>
										</div>
									)}
								</form.Field>
							)
						}
					</form.Subscribe>

					{/* Tags multi-select */}
					<form.Field name="tagIds">
						{(field) => (
							<div className="space-y-2">
								<Label>
									Tags <span className="text-muted-foreground">(optional)</span>
								</Label>
								<TagMultiSelect
									onChange={(tagIds) => field.handleChange(tagIds)}
									value={field.state.value}
								/>
							</div>
						)}
					</form.Field>

					<DialogFooter>
						<DialogClose
							render={
								<Button disabled={isPending} type="button" variant="outline">
									Cancel
								</Button>
							}
						/>
						<form.Subscribe>
							{(state) => (
								<Button
									disabled={!state.canSubmit || state.isSubmitting || isPending}
									type="submit"
								>
									{isPending ? "Saving..." : "Save"}
								</Button>
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
