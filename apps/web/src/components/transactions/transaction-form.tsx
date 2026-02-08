"use client";

import { getSymbol } from "@finora2/api/lib/currency";
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
	useCreateTransaction,
	useUpdateTransaction,
} from "@/hooks/use-transactions";
import { useUserSettings } from "@/hooks/use-user-settings";
import { cn } from "@/lib/utils";

import { TagMultiSelect } from "./tag-multi-select";

// Top-level regex patterns
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;
const DECIMAL_INPUT_PATTERN = /^\d*\.?\d{0,2}$/;

/**
 * Validation schema for transaction form
 */
const transactionSchema = z.object({
	type: z.enum(["INCOME", "EXPENSE"]),
	amount: z
		.string()
		.min(1, "Amount is required")
		.refine((val) => AMOUNT_PATTERN.test(val), "Enter a valid amount")
		.refine((val) => Number.parseFloat(val) > 0, "Amount must be positive")
		.refine(
			(val) => Number.parseFloat(val) <= 999_999_999.99,
			"Amount too large"
		),
	date: z.date({ message: "Date is required" }),
	description: z.string().max(500, "Notes must be 500 characters or less"),
	tagIds: z.array(z.string()),
});

interface TransactionFormProps {
	mode: "create" | "edit";
	transaction?: {
		id: string;
		type: "INCOME" | "EXPENSE";
		amountCents: bigint;
		date: Date;
		description: string | null;
		tags: Array<{ tag: { id: string } }>;
	};
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

/**
 * Transaction create/edit form in a dialog.
 * Per CONTEXT.md: "Modal/dialog", "Toggle/tabs at top for income/expense"
 */
export function TransactionForm({
	mode,
	transaction,
	open,
	onOpenChange,
	onSuccess,
}: TransactionFormProps) {
	const { data: settings } = useUserSettings();
	const currencyCode = settings?.currencyCode ?? "USD";
	const createTransaction = useCreateTransaction();
	const updateTransaction = useUpdateTransaction();

	const isPending = createTransaction.isPending || updateTransaction.isPending;

	// Convert amountCents (BigInt) to display string
	const getInitialAmount = () => {
		if (!transaction) {
			return "";
		}
		// Convert cents to dollars with 2 decimal places
		const cents = Number(transaction.amountCents);
		return (cents / 100).toFixed(2);
	};

	const form = useForm({
		defaultValues: {
			type: (transaction?.type ?? "EXPENSE") as "INCOME" | "EXPENSE",
			amount: getInitialAmount(),
			date: transaction?.date ?? new Date(),
			description: transaction?.description ?? "",
			tagIds: transaction?.tags.map((t) => t.tag.id) ?? [],
		},
		onSubmit: async ({ value }) => {
			if (mode === "create") {
				await createTransaction.mutateAsync({
					type: value.type,
					amount: value.amount,
					date: value.date,
					description: value.description || undefined,
					tagIds: value.tagIds.length > 0 ? value.tagIds : undefined,
				});
			} else if (transaction) {
				await updateTransaction.mutateAsync({
					id: transaction.id,
					type: value.type,
					amount: value.amount,
					date: value.date,
					description: value.description || undefined,
					tagIds: value.tagIds,
				});
			}
			onOpenChange(false);
			onSuccess?.();
		},
		validators: {
			onSubmit: transactionSchema,
		},
	});

	// Reset form when dialog opens with new transaction data
	const handleOpenChange = (newOpen: boolean) => {
		if (newOpen) {
			form.reset();
			form.setFieldValue("type", transaction?.type ?? "EXPENSE");
			form.setFieldValue("amount", getInitialAmount());
			form.setFieldValue("date", transaction?.date ?? new Date());
			form.setFieldValue("description", transaction?.description ?? "");
			form.setFieldValue(
				"tagIds",
				transaction?.tags.map((t) => t.tag.id) ?? []
			);
		}
		onOpenChange(newOpen);
	};

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>
						{mode === "create" ? "Add Transaction" : "Edit Transaction"}
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

					{/* Amount input */}
					<form.Field name="amount">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Amount</Label>
								<div className="relative">
									<span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground text-xs">
										{getSymbol(currencyCode)}
									</span>
									<Input
										autoFocus
										className="pl-6"
										id={field.name}
										inputMode="decimal"
										name={field.name}
										onBlur={field.handleBlur}
										onChange={(e) => {
											// Only allow numbers and one decimal point
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

					{/* Date picker */}
					<form.Field name="date">
						{(field) => (
							<div className="space-y-2">
								<Label>Date</Label>
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

					{/* Description/Notes */}
					<form.Field name="description">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									Notes{" "}
									<span className="text-muted-foreground">(optional)</span>
								</Label>
								<Input
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="What was this for?"
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
