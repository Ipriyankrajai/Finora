import { z } from "zod";

// CUID validation for IDs
export const cuidInput = z.string().cuid();

// Hex color validation
export const hexColorInput = z
	.string()
	.regex(
		/^#[0-9A-Fa-f]{6}$/,
		"Color must be a valid hex color (e.g., #FF0000)"
	);

// Trimmed string with length validation
export const trimmedString = (min: number, max: number) =>
	z
		.string()
		.trim()
		.min(min, `Must be at least ${min} character${min === 1 ? "" : "s"}`)
		.max(max, `Cannot exceed ${max} characters`);
