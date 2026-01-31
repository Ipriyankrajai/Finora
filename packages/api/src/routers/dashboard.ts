import db from "@finora2/db";
import {
	eachDayOfInterval,
	eachWeekOfInterval,
	format,
	startOfWeek,
	subMonths,
} from "date-fns";

import { protectedProcedure, router } from "../index";
import { projectPayoff } from "../lib/calculations";
import {
	amortizationScheduleInput,
	spendingTrendInput,
} from "../schemas/dashboard";

/**
 * Calculate the current balance of a loan from its payments
 */
function calculateCurrentBalance(
	principalCents: bigint,
	payments: { principalCents: bigint }[]
): bigint {
	const paidPrincipal = payments.reduce((sum, p) => sum + p.principalCents, 0n);
	return principalCents - paidPrincipal;
}

/**
 * Calculate total interest paid from payments
 */
function calculateTotalInterestPaid(
	payments: { interestCents: bigint }[]
): bigint {
	return payments.reduce((sum, p) => sum + p.interestCents, 0n);
}

export const dashboardRouter = router({
	/**
	 * Get dashboard summary with monthly income/expense, top spending tags, and loan overview
	 * Returns all data in a single round-trip for optimal performance
	 */
	summary: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		// Calculate date boundaries for current month
		const now = new Date();
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const monthEnd = new Date(
			now.getFullYear(),
			now.getMonth() + 1,
			0,
			23,
			59,
			59,
			999
		);

		// 1. Monthly summary - fetch transactions and aggregate
		const transactions = await db.transaction.findMany({
			where: {
				userId,
				date: {
					gte: monthStart,
					lte: monthEnd,
				},
			},
			select: {
				type: true,
				amountCents: true,
			},
		});

		const incomeCents = transactions
			.filter((t) => t.type === "INCOME")
			.reduce((sum, t) => sum + t.amountCents, 0n);

		const expenseCents = transactions
			.filter((t) => t.type === "EXPENSE")
			.reduce((sum, t) => sum + t.amountCents, 0n);

		const netCents = incomeCents - expenseCents;

		// 2. Top spending tags with "Other" grouping
		// Use raw SQL for performance per RESEARCH.md recommendation
		const spendingByTag = await db.$queryRaw<
			Array<{
				tagId: string;
				tagName: string;
				tagColor: string;
				totalCents: bigint;
			}>
		>`
      SELECT
        t.id as "tagId",
        t.name as "tagName",
        t.color as "tagColor",
        COALESCE(SUM(txn."amountCents"), 0)::bigint as "totalCents"
      FROM tag t
      LEFT JOIN transaction_tag tt ON t.id = tt."tagId"
      LEFT JOIN transaction txn ON tt."transactionId" = txn.id
        AND txn.type = 'EXPENSE'
        AND txn.date >= ${monthStart}
        AND txn.date <= ${monthEnd}
        AND txn."userId" = ${userId}
      WHERE t."userId" = ${userId} AND t."isActive" = true
      GROUP BY t.id, t.name, t.color
      HAVING COALESCE(SUM(txn."amountCents"), 0) > 0
      ORDER BY "totalCents" DESC
    `;

		// Top 5 tags for display
		const topTags = spendingByTag.slice(0, 5).map((tag) => ({
			tagId: tag.tagId,
			tagName: tag.tagName,
			tagColor: tag.tagColor,
			totalCents: tag.totalCents,
		}));

		// Sum of remaining tags
		const otherTagsTotal = spendingByTag
			.slice(5)
			.reduce((sum, tag) => sum + tag.totalCents, 0n);

		// 3. Loan overview with projections
		const loans = await db.loan.findMany({
			where: { userId },
			include: {
				payments: {
					select: {
						principalCents: true,
						interestCents: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});

		const loanOverview = loans.map((loan) => {
			const balanceCents = calculateCurrentBalance(
				loan.principalCents,
				loan.payments
			);
			const interestPaidCents = calculateTotalInterestPaid(loan.payments);

			// Get payoff projection using Phase 1 calculation utilities
			const projection = projectPayoff(
				balanceCents,
				loan.annualRatePercent,
				loan.monthlyPaymentCents
			);

			return {
				id: loan.id,
				name: loan.name,
				balanceCents,
				interestPaidCents,
				projectedPayoffDate: projection.payoffDate,
				totalInterestRemainingCents: projection.totalInterestCents,
			};
		});

		return {
			monthlySummary: {
				incomeCents,
				expenseCents,
				netCents,
			},
			topTags,
			otherTagsTotal,
			loanOverview,
		};
	}),

	/**
	 * Get spending trend data for timeline chart
	 * Returns time-series data with zero-filled periods (no gaps)
	 */
	getSpendingTrend: protectedProcedure
		.input(spendingTrendInput)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const { granularity, months } = input;

			// Calculate date range
			const now = new Date();
			const startDate = subMonths(now, months);

			// Fetch all transactions in date range
			const transactions = await db.transaction.findMany({
				where: {
					userId,
					date: {
						gte: startDate,
						lte: now,
					},
				},
				select: {
					type: true,
					amountCents: true,
					date: true,
				},
			});

			// Generate all periods in range (zero-filled)
			const periods =
				granularity === "weekly"
					? eachWeekOfInterval(
							{ start: startDate, end: now },
							{ weekStartsOn: 0 }
						)
					: eachDayOfInterval({ start: startDate, end: now });

			// Create a map keyed by period (ISO date string)
			const dataMap = new Map<
				string,
				{ date: Date; incomeCents: bigint; expenseCents: bigint }
			>();

			// Initialize all periods with zero values
			for (const period of periods) {
				const key =
					granularity === "weekly"
						? format(startOfWeek(period, { weekStartsOn: 0 }), "yyyy-MM-dd")
						: format(period, "yyyy-MM-dd");
				dataMap.set(key, {
					date: period,
					incomeCents: 0n,
					expenseCents: 0n,
				});
			}

			// Aggregate transactions into appropriate buckets
			for (const txn of transactions) {
				const txnDate = new Date(txn.date);
				const key =
					granularity === "weekly"
						? format(startOfWeek(txnDate, { weekStartsOn: 0 }), "yyyy-MM-dd")
						: format(txnDate, "yyyy-MM-dd");

				const bucket = dataMap.get(key);
				if (bucket) {
					if (txn.type === "INCOME") {
						bucket.incomeCents += txn.amountCents;
					} else {
						bucket.expenseCents += txn.amountCents;
					}
				}
			}

			// Convert map to sorted array
			const result = Array.from(dataMap.values()).sort(
				(a, b) => a.date.getTime() - b.date.getTime()
			);

			return result;
		}),

	/**
	 * Get amortization schedule for a specific loan
	 * Returns month-by-month balance projection (max 360 months = 30 years)
	 */
	getAmortizationSchedule: protectedProcedure
		.input(amortizationScheduleInput)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// Fetch loan with payments for authorization and balance calculation
			const loan = await db.loan.findFirst({
				where: {
					id: input.loanId,
					userId, // Authorization check
				},
				include: {
					payments: {
						select: {
							principalCents: true,
						},
					},
				},
			});

			if (!loan) {
				throw new Error("Loan not found");
			}

			// Calculate current balance
			const currentBalance = calculateCurrentBalance(
				loan.principalCents,
				loan.payments
			);

			// Generate amortization schedule
			const schedule: Array<{ month: Date; balanceCents: bigint }> = [];
			let balance = Number(currentBalance);
			const monthlyRate = loan.annualRatePercent / 100 / 12;
			const payment = Number(loan.monthlyPaymentCents);

			let monthOffset = 0;
			const now = new Date();

			// Add current balance as starting point
			schedule.push({
				month: new Date(now.getFullYear(), now.getMonth(), 1),
				balanceCents: currentBalance,
			});

			// Cap at 360 months (30 years) per RESEARCH.md
			while (balance > 0 && monthOffset < 360) {
				const interestThisMonth = balance * monthlyRate;

				// Check if payment covers interest
				if (payment <= interestThisMonth) {
					// Payment doesn't cover interest - will never pay off
					// Just return what we have
					break;
				}

				const principalThisMonth = Math.min(
					payment - interestThisMonth,
					balance
				);
				balance -= principalThisMonth;
				monthOffset++;

				const monthDate = new Date(
					now.getFullYear(),
					now.getMonth() + monthOffset,
					1
				);
				schedule.push({
					month: monthDate,
					balanceCents: balance > 0 ? BigInt(Math.round(balance)) : 0n,
				});
			}

			return schedule;
		}),
});
