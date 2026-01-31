import { z } from "zod";

/**
 * Reusable money input schema for validating dollar amounts
 * Accepts string input like "123.45" and validates format/range
 */
export const moneyInput = z
	.string()
	.trim()
	.regex(/^\d+(\.\d{1,2})?$/, {
		message: "Please enter a valid amount (e.g., 123.45)",
	})
	.refine((val) => Number.parseFloat(val) >= 0, {
		message: "Amount must be positive",
	})
	.refine((val) => Number.parseFloat(val) <= 999_999_999.99, {
		message: "Amount cannot exceed $999,999,999.99",
	});

/**
 * Notes/description input with length limit
 * Empty strings coerce to null for optional fields
 */
export const notesInput = z
	.string()
	.trim()
	.max(500, { message: "Notes cannot exceed 500 characters" })
	.transform((val) => (val === "" ? null : val))
	.nullable();

/**
 * Date preset options for quick filtering
 */
export const datePreset = z.enum([
	"last7days",
	"last30days",
	"thisMonth",
	"lastMonth",
	"thisYear",
]);

export type DatePreset = z.infer<typeof datePreset>;

/**
 * Create transaction input schema
 */
export const createTransactionInput = z.object({
	type: z.enum(["INCOME", "EXPENSE"]),
	amount: moneyInput,
	date: z.coerce.date(),
	description: notesInput.default(null),
	tagIds: z.array(z.string().cuid()).optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionInput>;

/**
 * Update transaction input schema - all fields optional except id
 */
export const updateTransactionInput = z.object({
	id: z.string().cuid(),
	type: z.enum(["INCOME", "EXPENSE"]).optional(),
	amount: moneyInput.optional(),
	date: z.coerce.date().optional(),
	description: notesInput.optional(),
	tagIds: z.array(z.string().cuid()).optional(),
});

export type UpdateTransactionInput = z.infer<typeof updateTransactionInput>;

/**
 * Transaction filter input with cursor-based pagination
 * Date preset and custom date range are mutually exclusive
 */
export const transactionFilterInput = z
	.object({
		cursor: z.string().cuid().optional(),
		limit: z.number().int().min(1).max(100).default(20),
		datePreset: datePreset.optional(),
		dateFrom: z.coerce.date().optional(),
		dateTo: z.coerce.date().optional(),
		type: z.enum(["INCOME", "EXPENSE"]).optional(),
		tagId: z.string().cuid().optional(),
		amountMin: z
			.string()
			.regex(/^\d+$/, { message: "Amount must be a whole number in cents" })
			.optional(),
		amountMax: z
			.string()
			.regex(/^\d+$/, { message: "Amount must be a whole number in cents" })
			.optional(),
	})
	.refine(
		(data) => {
			// Can't use both date preset and custom date range
			const hasPreset = data.datePreset !== undefined;
			const hasCustomRange =
				data.dateFrom !== undefined || data.dateTo !== undefined;
			return !(hasPreset && hasCustomRange);
		},
		{
			message:
				"Cannot use both date preset and custom date range. Choose one or the other.",
			path: ["datePreset"],
		}
	);

export type TransactionFilterInput = z.infer<typeof transactionFilterInput>;
