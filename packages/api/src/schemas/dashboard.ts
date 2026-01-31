import { z } from "zod";

/**
 * Spending trend input schema
 * Controls granularity and time range for trend data
 */
export const spendingTrendInput = z.object({
	granularity: z.enum(["weekly", "daily"]),
	months: z.number().int().min(1).max(12).default(3),
});

export type SpendingTrendInput = z.infer<typeof spendingTrendInput>;

/**
 * Spending trend data point schema
 * Represents income and expense totals for a time period
 */
export const spendingTrendDataPoint = z.object({
	date: z.date(),
	incomeCents: z.bigint(),
	expenseCents: z.bigint(),
});

export type SpendingTrendDataPoint = z.infer<typeof spendingTrendDataPoint>;

/**
 * Monthly summary schema for dashboard
 * Shows income, expenses, and net for the current month
 */
export const monthlySummarySchema = z.object({
	incomeCents: z.bigint(),
	expenseCents: z.bigint(),
	netCents: z.bigint(),
});

export type MonthlySummary = z.infer<typeof monthlySummarySchema>;

/**
 * Tag spending schema for dashboard
 * Shows spending breakdown by tag
 */
export const tagSpendingSchema = z.object({
	tagId: z.string(),
	tagName: z.string(),
	tagColor: z.string(),
	totalCents: z.bigint(),
});

export type TagSpending = z.infer<typeof tagSpendingSchema>;

/**
 * Loan overview schema for dashboard
 * Shows loan status with calculated balance and projections
 */
export const loanOverviewSchema = z.object({
	id: z.string(),
	name: z.string(),
	balanceCents: z.bigint(),
	interestPaidCents: z.bigint(),
	projectedPayoffDate: z.date(),
	totalInterestRemainingCents: z.bigint(),
});

export type LoanOverview = z.infer<typeof loanOverviewSchema>;

/**
 * Combined dashboard output schema
 * Returns all dashboard data in a single response
 */
export const dashboardOutputSchema = z.object({
	monthlySummary: monthlySummarySchema,
	topTags: z.array(tagSpendingSchema), // Top 5 spending tags
	otherTagsTotal: z.bigint(), // Sum of tags beyond top 5
	loanOverview: z.array(loanOverviewSchema),
});

export type DashboardOutput = z.infer<typeof dashboardOutputSchema>;
