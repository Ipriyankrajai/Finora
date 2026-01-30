import db from "@finora2/db";

import { protectedProcedure, router } from "../index";
import { projectPayoff } from "../lib/calculations";

/**
 * Calculate the current balance of a loan from its payments
 */
function calculateCurrentBalance(
  principalCents: bigint,
  payments: { principalCents: bigint }[]
): bigint {
  const paidPrincipal = payments.reduce(
    (sum, p) => sum + p.principalCents,
    0n
  );
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
});
