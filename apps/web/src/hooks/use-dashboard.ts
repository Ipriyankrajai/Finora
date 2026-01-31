"use client";

import { useQuery } from "@tanstack/react-query";

import { trpc } from "@/utils/trpc";

/**
 * Monthly income/expense/net summary
 */
export interface MonthlySummary {
	incomeCents: bigint;
	expenseCents: bigint;
	netCents: bigint;
}

/**
 * Tag spending data for pie chart
 */
export interface TagSpending {
	tagId: string;
	tagName: string;
	tagColor: string;
	totalCents: bigint;
}

/**
 * Loan overview with projected payoff
 */
export interface LoanOverview {
	id: string;
	name: string;
	balanceCents: bigint;
	interestPaidCents: bigint;
	projectedPayoffDate: Date;
	totalInterestRemainingCents: bigint;
}

/**
 * Dashboard data hook response
 */
export interface DashboardData {
	monthlySummary: MonthlySummary;
	topTags: TagSpending[];
	otherTagsTotal: bigint;
	loanOverview: LoanOverview[];
}

/**
 * Hook to fetch dashboard summary data.
 * Includes monthly income/expense/net, top spending tags, and loan overview.
 * Follows the pattern from use-loans.ts (useQuery with queryOptions).
 */
export function useDashboard() {
	const queryOptions = trpc.dashboard.summary.queryOptions();
	const query = useQuery(queryOptions);

	return {
		data: query.data as DashboardData | undefined,
		monthlySummary: query.data?.monthlySummary as MonthlySummary | undefined,
		topTags: (query.data?.topTags ?? []) as TagSpending[],
		otherTagsTotal: query.data?.otherTagsTotal ?? 0n,
		loanOverview: (query.data?.loanOverview ?? []) as LoanOverview[],
		isLoading: query.isLoading,
		isPending: query.isPending,
		error: query.error,
		refetch: query.refetch,
	};
}
