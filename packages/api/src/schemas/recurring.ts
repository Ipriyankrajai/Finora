import { z } from "zod";

import { moneyInput, notesInput } from "./transaction";

/**
 * Recurring frequency enum for schedule types
 */
export const recurringFrequency = z.enum([
	"DAILY",
	"WEEKLY",
	"BIWEEKLY",
	"MONTHLY",
	"YEARLY",
]);

export type RecurringFrequency = z.infer<typeof recurringFrequency>;

/**
 * Create recurring rule input with frequency-specific validation.
 *
 * Refinements:
 * 1. WEEKLY/BIWEEKLY requires dayOfWeek (0=Sunday..6=Saturday)
 * 2. endDate and maxOccurrences are mutually exclusive
 */
export const createRecurringRuleInput = z
	.object({
		type: z.enum(["INCOME", "EXPENSE"]).default("EXPENSE"),
		amount: moneyInput,
		description: notesInput.default(null),
		frequency: recurringFrequency,
		dayOfWeek: z.number().int().min(0).max(6).optional(),
		dayOfMonth: z.number().int().min(1).max(31).optional(),
		startDate: z.coerce.date(),
		endDate: z.coerce.date().optional(),
		maxOccurrences: z.number().int().min(1).optional(),
		tagIds: z.array(z.string().cuid()).optional(),
	})
	.refine(
		(data) => {
			if (
				(data.frequency === "WEEKLY" || data.frequency === "BIWEEKLY") &&
				data.dayOfWeek === undefined
			) {
				return false;
			}
			return true;
		},
		{
			message: "Day of week is required for weekly/biweekly frequency",
			path: ["dayOfWeek"],
		}
	)
	.refine(
		(data) => {
			if (data.endDate !== undefined && data.maxOccurrences !== undefined) {
				return false;
			}
			return true;
		},
		{
			message: "Cannot set both end date and occurrence count",
			path: ["endDate"],
		}
	);

export type CreateRecurringRuleInput = z.infer<typeof createRecurringRuleInput>;

/**
 * Update recurring rule input - all fields optional except id.
 * Same refinements apply when relevant fields are present.
 */
export const updateRecurringRuleInput = z
	.object({
		id: z.string().cuid(),
		type: z.enum(["INCOME", "EXPENSE"]).optional(),
		amount: moneyInput.optional(),
		description: notesInput.optional(),
		frequency: recurringFrequency.optional(),
		dayOfWeek: z.number().int().min(0).max(6).optional(),
		dayOfMonth: z.number().int().min(1).max(31).optional(),
		startDate: z.coerce.date().optional(),
		endDate: z.coerce.date().nullable().optional(),
		maxOccurrences: z.number().int().min(1).nullable().optional(),
		tagIds: z.array(z.string().cuid()).optional(),
	})
	.refine(
		(data) => {
			// Only validate when frequency is being set to WEEKLY/BIWEEKLY
			if (
				(data.frequency === "WEEKLY" || data.frequency === "BIWEEKLY") &&
				data.dayOfWeek === undefined
			) {
				return false;
			}
			return true;
		},
		{
			message: "Day of week is required for weekly/biweekly frequency",
			path: ["dayOfWeek"],
		}
	)
	.refine(
		(data) => {
			if (data.endDate !== undefined && data.maxOccurrences !== undefined) {
				// Allow clearing one or both (null values)
				if (data.endDate === null || data.maxOccurrences === null) {
					return true;
				}
				return false;
			}
			return true;
		},
		{
			message: "Cannot set both end date and occurrence count",
			path: ["endDate"],
		}
	);

export type UpdateRecurringRuleInput = z.infer<typeof updateRecurringRuleInput>;
