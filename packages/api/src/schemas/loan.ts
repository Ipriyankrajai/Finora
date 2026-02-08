import { z } from "zod";

import { moneyInput, notesInput } from "./transaction";

/**
 * Loan type matching Prisma enum
 * Categorizes loans by their purpose (auto, mortgage, personal, etc.)
 */
export const loanTypeSchema = z.enum([
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
]);

export type LoanTypeInput = z.infer<typeof loanTypeSchema>;

/**
 * Interest calculation type matching Prisma enum
 */
export const interestTypeSchema = z.enum(["SIMPLE", "COMPOUND"]);

export type InterestTypeInput = z.infer<typeof interestTypeSchema>;

/**
 * Create loan input schema
 */
export const createLoanInput = z.object({
	name: z
		.string()
		.trim()
		.min(1, { message: "Loan name is required" })
		.max(100, { message: "Loan name cannot exceed 100 characters" }),
	loanType: loanTypeSchema.default("OTHER"),
	interestType: interestTypeSchema.default("COMPOUND"),
	principal: moneyInput,
	annualRatePercent: z
		.number()
		.min(0, { message: "Interest rate cannot be negative" })
		.max(100, { message: "Interest rate cannot exceed 100%" }),
	termMonths: z
		.number()
		.int()
		.min(1, { message: "Term must be at least 1 month" })
		.max(600, { message: "Term cannot exceed 600 months (50 years)" }),
	monthlyPayment: moneyInput,
	startDate: z.coerce.date(),
	notes: notesInput.default(null),
});

export type CreateLoanInput = z.infer<typeof createLoanInput>;

/**
 * Update loan input schema - all fields optional except id
 */
export const updateLoanInput = z.object({
	id: z.string().cuid(),
	name: z
		.string()
		.trim()
		.min(1, { message: "Loan name is required" })
		.max(100, { message: "Loan name cannot exceed 100 characters" })
		.optional(),
	loanType: loanTypeSchema.optional(),
	interestType: interestTypeSchema.optional(),
	principal: moneyInput.optional(),
	annualRatePercent: z
		.number()
		.min(0, { message: "Interest rate cannot be negative" })
		.max(100, { message: "Interest rate cannot exceed 100%" })
		.optional(),
	termMonths: z
		.number()
		.int()
		.min(1, { message: "Term must be at least 1 month" })
		.max(600, { message: "Term cannot exceed 600 months (50 years)" })
		.optional(),
	monthlyPayment: moneyInput.optional(),
	startDate: z.coerce.date().optional(),
	notes: notesInput.optional(),
});

export type UpdateLoanInput = z.infer<typeof updateLoanInput>;

/**
 * Create payment input schema
 * Note: principal/interest split is calculated in the router based on loan terms
 */
export const createPaymentInput = z.object({
	loanId: z.string().cuid(),
	amount: moneyInput,
	paidAt: z.coerce.date(),
	isExtra: z.boolean().default(false),
});

export type CreatePaymentInput = z.infer<typeof createPaymentInput>;

/**
 * Loan ID input for single loan operations
 */
export const loanIdInput = z.object({
	id: z.string().cuid(),
});

export type LoanIdInput = z.infer<typeof loanIdInput>;

/**
 * Payment ID input for delete operations
 */
export const paymentIdInput = z.object({
	id: z.string().cuid(),
});

export type PaymentIdInput = z.infer<typeof paymentIdInput>;
