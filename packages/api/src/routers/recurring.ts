import db from "@finora2/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../index";
import { displayToCents } from "../lib/money";
import {
	computeInitialNextOccurrence,
	computeNextOccurrence,
} from "../lib/recurring";
import {
	createRecurringRuleInput,
	updateRecurringRuleInput,
} from "../schemas/recurring";

/**
 * Helper to verify ownership of a recurring rule.
 * Throws NOT_FOUND or UNAUTHORIZED if checks fail.
 */
async function verifyRuleOwnership(ruleId: string, userId: string) {
	const rule = await db.recurringRule.findUnique({
		where: { id: ruleId },
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
			message: "You don't have permission to access this rule",
		});
	}

	return rule;
}

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
	 * Pause an active recurring rule.
	 * Sets status to PAUSED so the generation engine skips it.
	 */
	pause: protectedProcedure
		.input(z.object({ id: z.string().cuid() }))
		.mutation(async ({ ctx, input }) => {
			const rule = await verifyRuleOwnership(input.id, ctx.session.user.id);

			if (rule.status === "PAUSED") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Rule is already paused",
				});
			}

			const updated = await db.recurringRule.update({
				where: { id: input.id },
				data: { status: "PAUSED" },
				include: {
					tags: { include: { tag: true } },
				},
			});

			return updated;
		}),

	/**
	 * Resume a paused recurring rule.
	 * Resets nextOccurrenceDate to today (or the next valid date from today)
	 * to prevent backlog generation of missed occurrences during the paused period.
	 */
	resume: protectedProcedure
		.input(z.object({ id: z.string().cuid() }))
		.mutation(async ({ ctx, input }) => {
			const rule = await verifyRuleOwnership(input.id, ctx.session.user.id);

			if (rule.status === "ACTIVE") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Rule is already active",
				});
			}

			// Reset nextOccurrenceDate to today or the next valid date from today.
			// This prevents backlog generation (pitfall #3 from RESEARCH.md).
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			const resetDate = computeInitialNextOccurrence(
				rule.frequency as
					| "DAILY"
					| "WEEKLY"
					| "BIWEEKLY"
					| "MONTHLY"
					| "YEARLY",
				today,
				rule.dayOfMonth ?? undefined
			);

			const updated = await db.recurringRule.update({
				where: { id: input.id },
				data: {
					status: "ACTIVE",
					nextOccurrenceDate: resetDate,
				},
				include: {
					tags: { include: { tag: true } },
				},
			});

			return updated;
		}),

	/**
	 * Skip a single upcoming occurrence without affecting future occurrences.
	 * Creates or updates a RecurringOccurrence with SKIPPED status.
	 */
	skipOccurrence: protectedProcedure
		.input(
			z.object({
				ruleId: z.string().cuid(),
				scheduledDate: z.coerce.date(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			await verifyRuleOwnership(input.ruleId, ctx.session.user.id);

			await db.recurringOccurrence.upsert({
				where: {
					ruleId_scheduledDate: {
						ruleId: input.ruleId,
						scheduledDate: input.scheduledDate,
					},
				},
				create: {
					ruleId: input.ruleId,
					scheduledDate: input.scheduledDate,
					status: "SKIPPED",
				},
				update: {
					status: "SKIPPED",
				},
			});

			return { success: true };
		}),

	/**
	 * Compute upcoming occurrence dates for a rule.
	 * Returns computed future dates with their skip status.
	 */
	upcomingOccurrences: protectedProcedure
		.input(
			z.object({
				ruleId: z.string().cuid(),
				count: z.number().int().min(1).max(10).default(5),
			})
		)
		.query(async ({ ctx, input }) => {
			const rule = await verifyRuleOwnership(input.ruleId, ctx.session.user.id);

			const dates: Date[] = [];
			let current = new Date(rule.nextOccurrenceDate);
			const anchorDay =
				rule.frequency === "MONTHLY"
					? (rule.dayOfMonth ?? undefined)
					: undefined;
			const frequency = rule.frequency as
				| "DAILY"
				| "WEEKLY"
				| "BIWEEKLY"
				| "MONTHLY"
				| "YEARLY";

			for (let i = 0; i < input.count; i++) {
				// Check end conditions
				if (rule.endDate && current > rule.endDate) {
					break;
				}
				if (
					rule.maxOccurrences &&
					rule.completedCount + i >= rule.maxOccurrences
				) {
					break;
				}

				dates.push(new Date(current));
				current = computeNextOccurrence(frequency, current, anchorDay);
			}

			// Check which dates already have occurrence records (e.g., pre-skipped)
			const existingOccurrences = await db.recurringOccurrence.findMany({
				where: {
					ruleId: input.ruleId,
					scheduledDate: { in: dates },
				},
				select: { scheduledDate: true, status: true },
			});

			const occurrenceMap = new Map(
				existingOccurrences.map((o) => [
					o.scheduledDate.toISOString(),
					o.status,
				])
			);

			return dates.map((scheduledDate) => ({
				scheduledDate,
				status:
					occurrenceMap.get(scheduledDate.toISOString()) === "SKIPPED"
						? ("skipped" as const)
						: ("upcoming" as const),
			}));
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
