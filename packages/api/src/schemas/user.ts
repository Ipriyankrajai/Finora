import { z } from "zod";

import { CURRENCY_CODES } from "../lib/currency";

export const updateProfileInput = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Must be at least 2 characters")
		.max(100, "Cannot exceed 100 characters"),
});

export const updateCurrencyInput = z.object({
	currencyCode: z.enum(CURRENCY_CODES),
});

export type UpdateProfileInput = z.infer<typeof updateProfileInput>;
export type UpdateCurrencyInput = z.infer<typeof updateCurrencyInput>;
