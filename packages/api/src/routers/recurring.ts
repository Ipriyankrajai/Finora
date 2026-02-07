import db from "@finora2/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../index";
import { displayToCents } from "../lib/money";
import { computeInitialNextOccurrence } from "../lib/recurring";
import {
	createRecurringRuleInput,
	updateRecurringRuleInput,
} from "../schemas/recurring";

export const recurringRouter = router({
	/**
	 * List all recurring rules for the current user
	 */
	list: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const rules = await db.recurringRule.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
			include: {
				tags: {
					include: {
						tag: true,
					},
				},
			},
		});

		return rules;
	}),

	/**
	 * Get a single recurring rule by ID with recent occurrences
	 */
	getById: protectedProcedure
		.input(z.object({ id: z.string().cuid() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const rule = await db.recurringRule.findUnique({
				where: { id: input.id },
				include: {
					tags: {
						include: {
							tag: true,
						},
					},
					occurrences: {
						orderBy: { scheduledDate: "desc" },
						take: 5,
					},
				},
			});

			if (!rule) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Recurring rule not found",
				});
			}

			if (rule.userId !== userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You don't have permission to view this rule",
				});
			}

			return rule;
		}),

	/**
	 * Create a new recurring rule with optional tags
	 */
	create: protectedProcedure
		.input(createRecurringRuleInput)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const {
				type,
				amount,
				description,
				frequency,
				dayOfWeek,
				dayOfMonth,
				startDate,
				endDate,
				maxOccurrences,
				tagIds,
			} = input;

			const amountCents = displayToCents(amount);

			// For MONTHLY rules, derive dayOfMonth from startDate if not provided
			const resolvedDayOfMonth =
				frequency === "MONTHLY" && dayOfMonth === undefined
					? startDate.getDate()
					: dayOfMonth;

			const nextOccurrenceDate = computeInitialNextOccurrence(
				frequency,
				startDate,
				resolvedDayOfMonth
			);

			const rule = await db.$transaction(async (tx) => {
				const created = await tx.recurringRule.create({
					data: {
						userId,
						type,
						amountCents,
						description,
						frequency,
						dayOfWeek,
						dayOfMonth: resolvedDayOfMonth,
						startDate,
						endDate,
						maxOccurrences,
						nextOccurrenceDate,
					},
				});

				if (tagIds && tagIds.length > 0) {
					await tx.recurringRuleTag.createMany({
						data: tagIds.map((tagId) => ({
							ruleId: created.id,
							tagId,
						})),
					});
				}

				return tx.recurringRule.findUnique({
					where: { id: created.id },
					include: {
						tags: {
							include: {
								tag: true,
							},
						},
					},
				});
			});

			return rule;
		}),

	/**
	 * Update an existing recurring rule
	 */
	update: protectedProcedure
		.input(updateRecurringRuleInput)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const { id, tagIds, amount, ...fields } = input;

			// Verify ownership
			const existing = await db.recurringRule.findUnique({
				where: { id },
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Recurring rule not found",
				});
			}

			if (existing.userId !== userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You don't have permission to update this rule",
				});
			}

			// Build update data from provided fields
			const updateData: Record<string, unknown> = {};

			if (fields.type !== undefined) {
				updateData.type = fields.type;
			}
			if (amount !== undefined) {
				updateData.amountCents = displayToCents(amount);
			}
			if (fields.description !== undefined) {
				updateData.description = fields.description;
			}
			if (fields.frequency !== undefined) {
				updateData.frequency = fields.frequency;
			}
			if (fields.dayOfWeek !== undefined) {
				updateData.dayOfWeek = fields.dayOfWeek;
			}
			if (fields.dayOfMonth !== undefined) {
				updateData.dayOfMonth = fields.dayOfMonth;
			}
			if (fields.startDate !== undefined) {
				updateData.startDate = fields.startDate;
			}
			if (fields.endDate !== undefined) {
				updateData.endDate = fields.endDate;
			}
			if (fields.maxOccurrences !== undefined) {
				updateData.maxOccurrences = fields.maxOccurrences;
			}

			const rule = await db.$transaction(async (tx) => {
				await tx.recurringRule.update({
					where: { id },
					data: updateData,
				});

				// Replace tags if tagIds provided
				if (tagIds !== undefined) {
					await tx.recurringRuleTag.deleteMany({
						where: { ruleId: id },
					});

					if (tagIds.length > 0) {
						await tx.recurringRuleTag.createMany({
							data: tagIds.map((tagId) => ({
								ruleId: id,
								tagId,
							})),
						});
					}
				}

				return tx.recurringRule.findUnique({
					where: { id },
					include: {
						tags: {
							include: {
								tag: true,
							},
						},
					},
				});
			});

			return rule;
		}),

	/**
	 * Delete a recurring rule.
	 * If deleteTransactions is true, also delete generated transactions.
	 * Otherwise cascade removes tracking but generated transactions remain standalone.
	 */
	delete: protectedProcedure
		.input(
			z.object({
				id: z.string().cuid(),
				deleteTransactions: z.boolean().default(false),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const existing = await db.recurringRule.findUnique({
				where: { id: input.id },
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Recurring rule not found",
				});
			}

			if (existing.userId !== userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You don't have permission to delete this rule",
				});
			}

			if (input.deleteTransactions) {
				// Delete all linked transactions first
				const occurrences = await db.recurringOccurrence.findMany({
					where: { ruleId: input.id, transactionId: { not: null } },
					select: { transactionId: true },
				});

				const transactionIds = occurrences
					.map((o) => o.transactionId)
					.filter((id): id is string => id !== null);

				if (transactionIds.length > 0) {
					await db.transaction.deleteMany({
						where: { id: { in: transactionIds } },
					});
				}
			}

			// Cascade handles RecurringRuleTag and RecurringOccurrence
			await db.recurringRule.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	/**
	 * Count today's generated recurring occurrences for the dashboard banner
	 */
	todayGenerated: protectedProcedure.query(async ({ ctx }) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const count = await db.recurringOccurrence.count({
			where: {
				rule: { userId: ctx.session.user.id },
				status: "GENERATED",
				generatedAt: { gte: today, lt: tomorrow },
			},
		});

		return { count };
	}),
});
