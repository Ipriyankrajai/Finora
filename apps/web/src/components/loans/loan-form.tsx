"use client";

import { getSymbol } from "@finora2/api/lib/currency";
import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
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
import type { LoanWithBalance } from "@/hooks/use-loans";
import { useCreateLoan, useUpdateLoan } from "@/hooks/use-loans";
import { useUserSettings } from "@/hooks/use-user-settings";

// Validation regex patterns
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;
const RATE_PATTERN = /^\d*\.?\d{0,2}$/;
const WHOLE_NUMBER_PATTERN = /^\d+$/;

/**
 * Validation schema for loan form
 */
const loanSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	loanType: z.enum([
		"PERSONAL",
		"AUTO",
		"MORTGAGE",
		"STUDENT",
		"BUSINESS",
		"CREDIT_CARD",
		"MEDICAL",
		"HOME_EQUITY",
		"PAYDAY",
		"CONSOLIDATION",
		"OTHER",
	]),
	interestType: z.enum(["SIMPLE", "COMPOUND"]),
	principal: z
		.string()
		.min(1, "Principal is required")
		.refine((val) => AMOUNT_PATTERN.test(val), "Enter valid amount")
		.refine((val) => Number.parseFloat(val) > 0, "Must be positive"),
	annualRatePercent: z
		.string()
		.min(1, "Rate is required")
		.refine((val) => RATE_PATTERN.test(val) && val !== "", "Enter valid rate")
		.refine(
			(val) => Number.parseFloat(val) >= 0 && Number.parseFloat(val) <= 100,
			"Rate must be 0-100%"
		),
	termMonths: z
		.string()
		.min(1, "Term is required")
		.refine((val) => WHOLE_NUMBER_PATTERN.test(val), "Enter whole number")
		.refine(
			(val) => Number.parseInt(val, 10) >= 1 && Number.parseInt(val, 10) <= 600,
			"Term must be 1-600 months"
		),
	monthlyPayment: z.string(), // Calculated, always valid
	startDate: z.date({ message: "Start date is required" }),
});

interface LoanFormProps {
	mode: "create" | "edit";
	loan?: LoanWithBalance;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

/**
 * Calculate monthly payment using PMT formula.
 * PMT = P * (r * (1+r)^n) / ((1+r)^n - 1)
 */
function calculateMonthlyPayment(
	principal: number,
	annualRate: number,
	termMonths: number
): number {
	if (principal <= 0 || termMonths <= 0) {
		return 0;
	}
	const monthlyRate = annualRate / 100 / 12;
	if (monthlyRate === 0) {
		return principal / termMonths;
	}
	const x = (1 + monthlyRate) ** termMonths;
	return (principal * x * monthlyRate) / (x - 1);
}

/**
 * Loan create/edit form in a dialog.
 * Per CONTEXT.md: Loan type dropdown, currency inputs, percentage input with %, auto-calculated payment
 */
export function LoanForm({
	mode,
	loan,
	open,
	onOpenChange,
	onSuccess,
}: LoanFormProps) {
	const { data: settings } = useUserSettings();
	const currencyCode = settings?.currencyCode ?? "USD";
	const createLoan = useCreateLoan();
	const updateLoan = useUpdateLoan();

	const isPending = createLoan.isPending || updateLoan.isPending;

	// Track calculated monthly payment separately for display
	const [calculatedPayment, setCalculatedPayment] = useState("");

	// Convert cents to display string
	const getInitialPrincipal = () => {
		if (!loan) {
			return "";
		}
		const cents = Number(loan.principalCents);
		return (cents / 100).toFixed(2);
	};

	const getInitialPayment = () => {
		if (!loan) {
			return "";
		}
		const cents = Number(loan.monthlyPaymentCents);
		return (cents / 100).toFixed(2);
	};

	const form = useForm({
		defaultValues: {
			name: loan?.name ?? "",
			loanType: (loan?.loanType ?? "OTHER") as
				| "PERSONAL"
				| "AUTO"
				| "MORTGAGE"
				| "STUDENT"
				| "BUSINESS"
				| "CREDIT_CARD"
				| "MEDICAL"
				| "HOME_EQUITY"
				| "PAYDAY"
				| "CONSOLIDATION"
				| "OTHER",
			interestType: (loan?.interestType ?? "COMPOUND") as "SIMPLE" | "COMPOUND",
			principal: getInitialPrincipal(),
			annualRatePercent: loan?.annualRatePercent?.toString() ?? "",
			termMonths: loan?.termMonths?.toString() ?? "",
			monthlyPayment: getInitialPayment(),
			startDate: loan?.startDate ?? new Date(),
		},
		onSubmit: async ({ value }) => {
			// Use calculated payment or manual if provided
			const paymentToUse = calculatedPayment || value.monthlyPayment;

			if (mode === "create") {
				await createLoan.mutateAsync({
					name: value.name,
					loanType: value.loanType,
					interestType: value.interestType,
					principal: value.principal,
					annualRatePercent: Number.parseFloat(value.annualRatePercent),
					termMonths: Number.parseInt(value.termMonths, 10),
					monthlyPayment: paymentToUse,
					startDate: value.startDate,
				});
			} else if (loan) {
				await updateLoan.mutateAsync({
					id: loan.id,
					name: value.name,
					loanType: value.loanType,
					interestType: value.interestType,
					principal: value.principal,
					annualRatePercent: Number.parseFloat(value.annualRatePercent),
					termMonths: Number.parseInt(value.termMonths, 10),
					monthlyPayment: paymentToUse,
					startDate: value.startDate,
				});
			}
			onOpenChange(false);
			onSuccess?.();
		},
		validators: {
			onSubmit: loanSchema,
		},
	});

	// Helper to recalculate payment
	const recalculatePayment = (
		principalStr: string,
		rateStr: string,
		termStr: string
	) => {
		const principal = Number.parseFloat(principalStr || "0");
		const rate = Number.parseFloat(rateStr || "0");
		const term = Number.parseInt(termStr || "0", 10);

		if (principal > 0 && term > 0) {
			const payment = calculateMonthlyPayment(principal, rate, term);
			setCalculatedPayment(payment.toFixed(2));
		} else {
			setCalculatedPayment("");
		}
	};

	// Initialize calculated payment on mount for edit mode
	useEffect(() => {
		if (mode === "edit" && loan?.monthlyPaymentCents) {
			const cents = Number(loan.monthlyPaymentCents);
			setCalculatedPayment((cents / 100).toFixed(2));
		}
	}, [mode, loan?.monthlyPaymentCents]);

	// Reset form when dialog opens with new loan data
	const handleOpenChange = (newOpen: boolean) => {
		if (newOpen) {
			// Reset form and populate with loan data when opening
			form.reset();
			form.setFieldValue("name", loan?.name ?? "");
			form.setFieldValue("loanType", loan?.loanType ?? "PERSONAL");
			form.setFieldValue("interestType", loan?.interestType ?? "COMPOUND");
			form.setFieldValue("principal", getInitialPrincipal());
			form.setFieldValue(
				"annualRatePercent",
				loan?.annualRatePercent?.toString() ?? ""
			);
			form.setFieldValue("termMonths", loan?.termMonths?.toString() ?? "");
			form.setFieldValue("monthlyPayment", getInitialPayment());
			form.setFieldValue("startDate", loan?.startDate ?? new Date());
			setCalculatedPayment(getInitialPayment());
		} else {
			// Also reset calculated payment when closing to prevent stale data
			setCalculatedPayment("");
		}
		onOpenChange(newOpen);
	};

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>
						{mode === "create" ? "Add Loan" : "Edit Loan"}
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
					{/* Name input */}
					<form.Field name="name">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Loan Name</Label>
								<Input
									autoFocus
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="e.g., Car Loan, Mortgage"
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

					{/* Loan Type select */}
					<form.Field name="loanType">
						{(field) => (
							<div className="space-y-2">
								<Label>Loan Type</Label>
								<Select
									onValueChange={(value) =>
										field.handleChange(
											value as
												| "PERSONAL"
												| "AUTO"
												| "MORTGAGE"
												| "STUDENT"
												| "BUSINESS"
												| "CREDIT_CARD"
												| "MEDICAL"
												| "HOME_EQUITY"
												| "PAYDAY"
												| "CONSOLIDATION"
												| "OTHER"
										)
									}
									value={field.state.value}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select loan type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="PERSONAL">Personal Loan</SelectItem>
										<SelectItem value="AUTO">Auto/Car Loan</SelectItem>
										<SelectItem value="MORTGAGE">Mortgage</SelectItem>
										<SelectItem value="STUDENT">Student Loan</SelectItem>
										<SelectItem value="BUSINESS">Business Loan</SelectItem>
										<SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
										<SelectItem value="MEDICAL">Medical Loan</SelectItem>
										<SelectItem value="HOME_EQUITY">Home Equity</SelectItem>
										<SelectItem value="PAYDAY">Payday Loan</SelectItem>
										<SelectItem value="CONSOLIDATION">
											Consolidation Loan
										</SelectItem>
										<SelectItem value="OTHER">Other</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}
					</form.Field>

					{/* Interest Type select */}
					<form.Field name="interestType">
						{(field) => (
							<div className="space-y-2">
								<Label>Interest Type</Label>
								<Select
									onValueChange={(value) =>
										field.handleChange(value as "SIMPLE" | "COMPOUND")
									}
									value={field.state.value}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select interest type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="COMPOUND">Compound</SelectItem>
										<SelectItem value="SIMPLE">Simple</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}
					</form.Field>

					{/* Principal input */}
					<form.Field name="principal">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Principal Amount</Label>
								<div className="relative">
									<span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground text-xs">
										{getSymbol(currencyCode)}
									</span>
									<Input
										className="pl-6"
										id={field.name}
										inputMode="decimal"
										name={field.name}
										onBlur={field.handleBlur}
										onChange={(e) => {
											const val = e.target.value;
											if (val === "" || RATE_PATTERN.test(val)) {
												field.handleChange(val);
												// Recalculate payment
												recalculatePayment(
													val,
													form.getFieldValue("annualRatePercent"),
													form.getFieldValue("termMonths")
												);
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

					{/* Interest Rate input */}
					<form.Field name="annualRatePercent">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Annual Interest Rate</Label>
								<div className="relative">
									<Input
										className="pr-8"
										id={field.name}
										inputMode="decimal"
										name={field.name}
										onBlur={field.handleBlur}
										onChange={(e) => {
											const val = e.target.value;
											if (val === "" || RATE_PATTERN.test(val)) {
												field.handleChange(val);
												// Recalculate payment
												recalculatePayment(
													form.getFieldValue("principal"),
													val,
													form.getFieldValue("termMonths")
												);
											}
										}}
										placeholder="5.00"
										type="text"
										value={field.state.value}
									/>
									<span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground text-xs">
										%
									</span>
								</div>
								{field.state.meta.errors.map((error) => (
									<p className="text-destructive text-xs" key={error?.message}>
										{error?.message}
									</p>
								))}
							</div>
						)}
					</form.Field>

					{/* Term input */}
					<form.Field name="termMonths">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Loan Term (months)</Label>
								<div className="relative">
									<Input
										id={field.name}
										inputMode="numeric"
										name={field.name}
										onBlur={field.handleBlur}
										onChange={(e) => {
											const val = e.target.value;
											if (val === "" || WHOLE_NUMBER_PATTERN.test(val)) {
												field.handleChange(val);
												// Recalculate payment
												recalculatePayment(
													form.getFieldValue("principal"),
													form.getFieldValue("annualRatePercent"),
													val
												);
											}
										}}
										placeholder="60"
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

					{/* Monthly Payment - calculated/display */}
					<div className="space-y-2">
						<Label>Monthly Payment (calculated)</Label>
						<div className="relative">
							<span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground text-xs">
								{getSymbol(currencyCode)}
							</span>
							<Input
								className="bg-muted/50 pl-6"
								placeholder="Auto-calculated"
								readOnly
								type="text"
								value={calculatedPayment}
							/>
						</div>
						<p className="text-muted-foreground text-xs">
							Based on principal, rate, and term
						</p>
					</div>

					{/* Start Date picker */}
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
									disabled={
										!state.canSubmit ||
										state.isSubmitting ||
										isPending ||
										!calculatedPayment
									}
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
