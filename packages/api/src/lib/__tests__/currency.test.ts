import { describe, expect, it } from "vitest";
import {
	CURRENCIES,
	CURRENCY_CODES,
	getCurrencyOptions,
	getLabel,
	getOptionLabel,
	getSymbol,
	symbolToCode,
} from "../currency";

describe("currency utilities", () => {
	describe("CURRENCIES", () => {
		it("contains 10 currencies", () => {
			expect(CURRENCIES).toHaveLength(10);
		});

		it("has USD as the first entry", () => {
			expect(CURRENCIES[0]).toEqual({
				code: "USD",
				symbol: "$",
				label: "US Dollar",
			});
		});
	});

	describe("CURRENCY_CODES", () => {
		it("contains all currency codes", () => {
			expect(CURRENCY_CODES).toContain("USD");
			expect(CURRENCY_CODES).toContain("GBP");
			expect(CURRENCY_CODES).toContain("EUR");
			expect(CURRENCY_CODES).toHaveLength(10);
		});
	});

	describe("getSymbol", () => {
		it("returns symbol for known code", () => {
			expect(getSymbol("USD")).toBe("$");
			expect(getSymbol("GBP")).toBe("£");
			expect(getSymbol("EUR")).toBe("€");
			expect(getSymbol("JPY")).toBe("¥");
			expect(getSymbol("INR")).toBe("₹");
			expect(getSymbol("AUD")).toBe("A$");
			expect(getSymbol("CAD")).toBe("C$");
			expect(getSymbol("CHF")).toBe("CHF");
			expect(getSymbol("BRL")).toBe("R$");
			expect(getSymbol("KRW")).toBe("₩");
		});

		it("returns $ for unknown code", () => {
			expect(getSymbol("XYZ")).toBe("$");
		});
	});

	describe("getLabel", () => {
		it("returns label for known code", () => {
			expect(getLabel("USD")).toBe("US Dollar");
			expect(getLabel("GBP")).toBe("British Pound");
		});

		it("returns code itself for unknown code", () => {
			expect(getLabel("XYZ")).toBe("XYZ");
		});
	});

	describe("getOptionLabel", () => {
		it("returns formatted label", () => {
			expect(getOptionLabel("USD")).toBe("$ - US Dollar");
			expect(getOptionLabel("GBP")).toBe("£ - British Pound");
		});

		it("returns code for unknown code", () => {
			expect(getOptionLabel("XYZ")).toBe("XYZ");
		});
	});

	describe("getCurrencyOptions", () => {
		it("returns options with value and label", () => {
			const options = getCurrencyOptions();
			expect(options).toHaveLength(10);
			expect(options[0]).toEqual({
				value: "USD",
				label: "$ - US Dollar",
			});
		});
	});

	describe("symbolToCode", () => {
		it("maps known symbols to codes", () => {
			expect(symbolToCode("$")).toBe("USD");
			expect(symbolToCode("£")).toBe("GBP");
			expect(symbolToCode("€")).toBe("EUR");
		});

		it("returns USD for unknown symbol", () => {
			expect(symbolToCode("?")).toBe("USD");
		});
	});
});
