"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * Date preset options for quick filtering
 */
export type DatePreset =
	| "last7days"
	| "last30days"
	| "thisMonth"
	| "lastMonth"
	| "thisYear";

/**
 * Transaction type filter options
 */
export type TransactionType = "INCOME" | "EXPENSE";

/**
 * Filter state stored in URL search params
 */
export interface TransactionFilters {
	datePreset?: DatePreset;
	dateFrom?: string; // ISO date string
	dateTo?: string; // ISO date string
	type?: TransactionType;
	tagId?: string;
	amountMin?: string; // In cents as string
	amountMax?: string; // In cents as string
	page: number;
}

/**
 * Label mapping for date presets
 */
export const datePresetLabels: Record<DatePreset, string> = {
	last7days: "Last 7 days",
	last30days: "Last 30 days",
	thisMonth: "This month",
	lastMonth: "Last month",
	thisYear: "This year",
};

/**
 * Hook to manage transaction filter state via URL search params.
 * Enables shareable/bookmarkable filtered views.
 */
export function useTransactionFilters() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	// Parse current filters from URL
	const filters: TransactionFilters = useMemo(() => {
		return {
			datePreset: searchParams.get("datePreset") as DatePreset | undefined,
			dateFrom: searchParams.get("dateFrom") ?? undefined,
			dateTo: searchParams.get("dateTo") ?? undefined,
			type: searchParams.get("type") as TransactionType | undefined,
			tagId: searchParams.get("tagId") ?? undefined,
			amountMin: searchParams.get("amountMin") ?? undefined,
			amountMax: searchParams.get("amountMax") ?? undefined,
			page: Number.parseInt(searchParams.get("page") ?? "1", 10),
		};
	}, [searchParams]);

	// Set individual filter (auto-resets to page 1 for non-page filters)
	const setFilter = useCallback(
		<K extends keyof TransactionFilters>(
			key: K,
			value: TransactionFilters[K] | null
		) => {
			const params = new URLSearchParams(searchParams.toString());

			if (value === null || value === undefined || value === "") {
				params.delete(key);
			} else {
				params.set(key, String(value));
			}

			// Reset to page 1 when changing filters (except page itself)
			if (key !== "page") {
				params.delete("page");
			}

			const paramsStr = params.toString();
			const url = paramsStr ? `${pathname}?${paramsStr}` : pathname;
			router.push(url as "/dashboard/transactions");
		},
		[searchParams, router, pathname]
	);

	// Set multiple filters at once
	const setFilters = useCallback(
		(updates: Partial<TransactionFilters>) => {
			const params = new URLSearchParams(searchParams.toString());

			for (const [key, value] of Object.entries(updates)) {
				if (value === null || value === undefined || value === "") {
					params.delete(key);
				} else {
					params.set(key, String(value));
				}
			}

			// Reset to page 1 when changing any filter except page
			if (!("page" in updates)) {
				params.delete("page");
			}

			const paramsStr = params.toString();
			const url = paramsStr ? `${pathname}?${paramsStr}` : pathname;
			router.push(url as "/dashboard/transactions");
		},
		[searchParams, router, pathname]
	);

	// Clear all filters
	const clearFilters = useCallback(() => {
		router.push(pathname as "/dashboard/transactions");
	}, [router, pathname]);

	// Get active filter count for UI badge (excluding page)
	const activeFilterCount = useMemo(() => {
		let count = 0;
		if (filters.datePreset) count++;
		if (filters.dateFrom || filters.dateTo) count++;
		if (filters.type) count++;
		if (filters.tagId) count++;
		if (filters.amountMin || filters.amountMax) count++;
		return count;
	}, [filters]);

	return {
		filters,
		setFilter,
		setFilters,
		clearFilters,
		activeFilterCount,
	};
}
