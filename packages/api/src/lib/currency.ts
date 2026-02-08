export const CURRENCIES = [
	{ code: "USD", symbol: "$", label: "US Dollar" },
	{ code: "GBP", symbol: "\u00A3", label: "British Pound" },
	{ code: "EUR", symbol: "\u20AC", label: "Euro" },
	{ code: "JPY", symbol: "\u00A5", label: "Japanese Yen" },
	{ code: "INR", symbol: "\u20B9", label: "Indian Rupee" },
	{ code: "AUD", symbol: "A$", label: "Australian Dollar" },
	{ code: "CAD", symbol: "C$", label: "Canadian Dollar" },
	{ code: "CHF", symbol: "CHF", label: "Swiss Franc" },
	{ code: "BRL", symbol: "R$", label: "Brazilian Real" },
	{ code: "KRW", symbol: "\u20A9", label: "South Korean Won" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code) as [
	CurrencyCode,
	...CurrencyCode[],
];

const CODE_MAP: Map<string, (typeof CURRENCIES)[number]> = new Map(
	CURRENCIES.map((c) => [c.code, c])
);
const SYMBOL_MAP: Map<string, (typeof CURRENCIES)[number]> = new Map(
	CURRENCIES.map((c) => [c.symbol, c])
);

export function getSymbol(code: string): string {
	return CODE_MAP.get(code)?.symbol ?? "$";
}

export function getLabel(code: string): string {
	return CODE_MAP.get(code)?.label ?? code;
}

export function getOptionLabel(code: string): string {
	const info = CODE_MAP.get(code);
	if (!info) {
		return code;
	}
	return `${info.symbol} - ${info.label}`;
}

export function getCurrencyOptions() {
	return CURRENCIES.map((c) => ({
		value: c.code,
		label: `${c.symbol} - ${c.label}`,
	}));
}

export function symbolToCode(symbol: string): string {
	return SYMBOL_MAP.get(symbol)?.code ?? "USD";
}
