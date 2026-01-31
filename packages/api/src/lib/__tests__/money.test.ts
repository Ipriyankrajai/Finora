import { describe, expect, it } from "vitest";
import { centsToDisplay, displayToCents, roundCents } from "../money";

describe("money utilities", () => {
	describe("displayToCents", () => {
		it("converts simple dollar amount", () => {
			expect(displayToCents("100.00")).toBe(10000n);
		});

		it("converts formatted amount with dollar sign", () => {
			expect(displayToCents("$1,234.56")).toBe(123456n);
		});

		it("converts amount without decimal", () => {
			expect(displayToCents("50")).toBe(5000n);
		});

		it("handles negative amounts", () => {
			expect(displayToCents("-$50.00")).toBe(-5000n);
		});

		it("handles zero", () => {
			expect(displayToCents("0")).toBe(0n);
		});

		it("handles small cents", () => {
			expect(displayToCents("0.01")).toBe(1n);
		});
	});

	describe("centsToDisplay", () => {
		it("formats cents to dollar string", () => {
			expect(centsToDisplay(10000n)).toBe("$100.00");
		});

		it("formats with thousands separator", () => {
			expect(centsToDisplay(123456n)).toBe("$1,234.56");
		});

		it("formats negative amounts", () => {
			expect(centsToDisplay(-5000n)).toBe("-$50.00");
		});

		it("formats zero", () => {
			expect(centsToDisplay(0n)).toBe("$0.00");
		});

		it("formats single cent", () => {
			expect(centsToDisplay(1n)).toBe("$0.01");
		});

		it("formats large amounts", () => {
			expect(centsToDisplay(100000000n)).toBe("$1,000,000.00");
		});
	});

	describe("roundCents", () => {
		it("rounds half-up (0.5 -> 1)", () => {
			expect(roundCents(0.5)).toBe(1n);
		});

		it("rounds down below half", () => {
			expect(roundCents(0.4)).toBe(0n);
		});

		it("handles negative rounding", () => {
			expect(roundCents(-0.5)).toBe(0n); // Math.round behavior
		});
	});
});
