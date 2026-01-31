import { TRPCError } from "@trpc/server";

import db, { InterestType } from "@finora2/db";

import { protectedProcedure, router } from "../index";
import { projectPayoff } from "../lib/calculations";
import { displayToCents, roundCents } from "../lib/money";
import {
  createLoanInput,
  createPaymentInput,
  loanIdInput,
  paymentIdInput,
  updateLoanInput,
} from "../schemas/loan";

/**
 * Calculate the principal/interest split for a payment based on current balance
 * Uses standard amortization formula where interest = balance * monthly_rate
 * Extra payments go entirely to principal (no interest portion)
 */
function calculatePaymentSplit(
  currentBalanceCents: bigint,
  annualRatePercent: number,
  paymentAmountCents: bigint,
  isExtra: boolean
): { principalCents: bigint; interestCents: bigint } {
  // Extra payments go entirely to principal
  if (isExtra) {
    // Principal can't exceed remaining balance
    const principalCents =
      paymentAmountCents > currentBalanceCents
        ? currentBalanceCents
        : paymentAmountCents;
    return {
      principalCents,
      interestCents: 0n,
    };
  }

  const monthlyRate = annualRatePercent / 100 / 12;
  const interestCents = roundCents(Number(currentBalanceCents) * monthlyRate);

  // Principal is payment minus interest, but can't exceed remaining balance
  const maxPrincipal =
    paymentAmountCents - interestCents > currentBalanceCents
      ? currentBalanceCents
      : paymentAmountCents - interestCents;

  // If payment is less than interest, all goes to interest
  const principalCents = maxPrincipal > 0n ? maxPrincipal : 0n;
  const actualInterestCents =
    maxPrincipal > 0n ? interestCents : paymentAmountCents;

  return {
    principalCents,
    interestCents: actualInterestCents,
  };
}

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

/**
 * Calculate the payoff amount (what you'd pay today to close the loan)
 * This includes remaining principal + current period's accrued interest
 */
function calculatePayoffAmount(
  remainingPrincipalCents: bigint,
  annualRatePercent: number
): { payoffAmountCents: bigint; currentPeriodInterestCents: bigint } {
  // If loan is paid off, no payoff needed
  if (remainingPrincipalCents <= 0n) {
    return { payoffAmountCents: 0n, currentPeriodInterestCents: 0n };
  }

  const monthlyRate = annualRatePercent / 100 / 12;
  const currentPeriodInterestCents = roundCents(
    Number(remainingPrincipalCents) * monthlyRate
  );
  const payoffAmountCents = remainingPrincipalCents + currentPeriodInterestCents;

  return { payoffAmountCents, currentPeriodInterestCents };
}

export const loanRouter = router({
  /**
   * List all loans for the current user with calculated balances
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

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

    // Calculate balances for each loan
    return loans.map((loan) => {
      const balanceCents = calculateCurrentBalance(
        loan.principalCents,
        loan.payments
      );
      const totalInterestPaidCents = calculateTotalInterestPaid(loan.payments);

      // Calculate payoff amount (principal + current period interest)
      const { payoffAmountCents, currentPeriodInterestCents } =
        calculatePayoffAmount(balanceCents, loan.annualRatePercent);

      // Remove payments from response to keep it clean
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { payments, ...loanWithoutPayments } = loan;

      return {
        ...loanWithoutPayments,
        balanceCents,
        totalInterestPaidCents,
        payoffAmountCents,
        currentPeriodInterestCents,
      };
    });
  }),

  /**
   * Get a single loan with full details, payments, and projections
   */
  getById: protectedProcedure
    .input(loanIdInput)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const loan = await db.loan.findUnique({
        where: { id: input.id },
        include: {
          payments: {
            orderBy: { paidAt: "desc" },
          },
        },
      });

      if (!loan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Loan not found",
        });
      }

      if (loan.userId !== userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You don't have permission to view this loan",
        });
      }

      // Calculate current balance
      const balanceCents = calculateCurrentBalance(
        loan.principalCents,
        loan.payments
      );

      // Calculate total interest paid
      const totalInterestPaidCents = calculateTotalInterestPaid(loan.payments);

      // Calculate payoff amount (principal + current period interest)
      const { payoffAmountCents, currentPeriodInterestCents } =
        calculatePayoffAmount(balanceCents, loan.annualRatePercent);

      // Get payoff projection using Phase 1 calculation utilities
      const projection = projectPayoff(
        balanceCents,
        loan.annualRatePercent,
        loan.monthlyPaymentCents
      );

      return {
        ...loan,
        balanceCents,
        totalInterestPaidCents,
        payoffAmountCents,
        currentPeriodInterestCents,
        projection: {
          monthsRemaining: projection.monthsRemaining,
          totalInterestRemainingCents: projection.totalInterestCents,
          projectedPayoffDate: projection.payoffDate,
        },
      };
    }),

  /**
   * Create a new loan
   */
  create: protectedProcedure
    .input(createLoanInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Convert money fields from display strings to cents
      const principalCents = displayToCents(input.principal);
      const monthlyPaymentCents = displayToCents(input.monthlyPayment);

      const loan = await db.loan.create({
        data: {
          userId,
          name: input.name,
          interestType: input.interestType as InterestType,
          principalCents,
          annualRatePercent: input.annualRatePercent,
          termMonths: input.termMonths,
          monthlyPaymentCents,
          startDate: input.startDate,
        },
      });

      return loan;
    }),

  /**
   * Update an existing loan
   */
  update: protectedProcedure
    .input(updateLoanInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, ...updateFields } = input;

      // First check ownership
      const existing = await db.loan.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Loan not found",
        });
      }

      if (existing.userId !== userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You don't have permission to update this loan",
        });
      }

      // Build update data, converting money fields if provided
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {};

      if (updateFields.name !== undefined) updateData.name = updateFields.name;
      if (updateFields.interestType !== undefined)
        updateData.interestType = updateFields.interestType as InterestType;
      if (updateFields.principal !== undefined)
        updateData.principalCents = displayToCents(updateFields.principal);
      if (updateFields.annualRatePercent !== undefined)
        updateData.annualRatePercent = updateFields.annualRatePercent;
      if (updateFields.termMonths !== undefined)
        updateData.termMonths = updateFields.termMonths;
      if (updateFields.monthlyPayment !== undefined)
        updateData.monthlyPaymentCents = displayToCents(
          updateFields.monthlyPayment
        );
      if (updateFields.startDate !== undefined)
        updateData.startDate = updateFields.startDate;

      const loan = await db.loan.update({
        where: { id },
        data: updateData,
      });

      return loan;
    }),

  /**
   * Delete a loan (hard delete - cascade deletes payments)
   */
  delete: protectedProcedure
    .input(loanIdInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // First check ownership
      const existing = await db.loan.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Loan not found",
        });
      }

      if (existing.userId !== userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You don't have permission to delete this loan",
        });
      }

      // Hard delete - cascade will handle LoanPayment cleanup
      await db.loan.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Add a payment to a loan with automatic principal/interest split
   */
  addPayment: protectedProcedure
    .input(createPaymentInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Find the loan and verify ownership
      const loan = await db.loan.findUnique({
        where: { id: input.loanId },
        include: {
          payments: {
            select: { principalCents: true },
          },
        },
      });

      if (!loan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Loan not found",
        });
      }

      if (loan.userId !== userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You don't have permission to add payments to this loan",
        });
      }

      // Calculate current balance
      const currentBalance = calculateCurrentBalance(
        loan.principalCents,
        loan.payments
      );

      // Check if loan is already paid off
      if (currentBalance <= 0n) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This loan has already been paid off",
        });
      }

      // Calculate payoff amount (what you'd pay today to close the loan)
      const { payoffAmountCents } = calculatePayoffAmount(
        currentBalance,
        loan.annualRatePercent
      );

      // Convert payment amount to cents
      const amountCents = displayToCents(input.amount);

      // Validate payment doesn't exceed payoff amount (principal + current interest)
      if (amountCents > payoffAmountCents) {
        const payoffDollars = (Number(payoffAmountCents) / 100).toFixed(2);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Payment amount exceeds payoff amount. Maximum payment allowed is $${payoffDollars}`,
        });
      }

      // Calculate principal/interest split based on current balance
      // Extra payments go entirely to principal (no interest)
      const { principalCents, interestCents } = calculatePaymentSplit(
        currentBalance,
        loan.annualRatePercent,
        amountCents,
        input.isExtra
      );

      // Create the payment
      const payment = await db.loanPayment.create({
        data: {
          loanId: input.loanId,
          amountCents,
          principalCents,
          interestCents,
          isExtra: input.isExtra,
          paidAt: input.paidAt,
        },
      });

      return payment;
    }),

  /**
   * Delete a payment from a loan
   */
  deletePayment: protectedProcedure
    .input(paymentIdInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Find the payment with its loan to verify ownership
      const payment = await db.loanPayment.findUnique({
        where: { id: input.id },
        include: {
          loan: {
            select: { userId: true },
          },
        },
      });

      if (!payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment not found",
        });
      }

      if (payment.loan.userId !== userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You don't have permission to delete this payment",
        });
      }

      // Hard delete
      await db.loanPayment.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
