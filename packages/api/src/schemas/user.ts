import { z } from "zod";

export const updateProfileInput = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Must be at least 2 characters")
		.max(100, "Cannot exceed 100 characters"),
});

export const updateCurrencyInput = z.object({
	currencySymbol: z
		.string()
		.min(1, "Must be at least 1 character")
		.max(3, "Cannot exceed 3 characters"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileInput>;
export type UpdateCurrencyInput = z.infer<typeof updateCurrencyInput>;
