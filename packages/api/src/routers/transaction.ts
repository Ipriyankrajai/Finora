import db from "@finora2/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "../index";
import { displayToCents } from "../lib/money";
import {
	createTransactionInput,
	type DatePreset,
	transactionFilterInput,
	updateTransactionInput,
} from "../schemas/transaction";

/**
 * Calculate date range from a preset string
 */
function getDateRangeFromPreset(preset: DatePreset): { from: Date; to: Date } {
	const now = new Date();
	const to = new Date(now);
	let from: Date;

	switch (preset) {
		case "last7days":
			from = new Date(now);
			from.setDate(from.getDate() - 7);
			break;
		case "last30days":
			from = new Date(now);
			from.setDate(from.getDate() - 30);
			break;
		case "thisMonth":
			from = new Date(now.getFullYear(), now.getMonth(), 1);
			break;
		case "lastMonth":
			from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
			to.setDate(0); // Last day of previous month
			break;
		case "thisYear":
			from = new Date(now.getFullYear(), 0, 1);
			break;
		default:
			throw new Error(`Unknown date preset: ${preset}`);
	}

	return { from, to };
}

export const transactionRouter = router({
	/**
	 * List transactions with cursor-based pagination and filtering
	 */
	list: protectedProcedure
		.input(transactionFilterInput)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const {
				cursor,
				limit,
				datePreset,
				dateFrom,
				dateTo,
				type,
				tagId,
				amountMin,
				amountMax,
			} = input;

			// Build where clause dynamically
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const where: any = {
				userId,
			};

			// Date filtering - preset or custom range
			if (datePreset) {
				const { from, to } = getDateRangeFromPreset(datePreset);
				where.date = {
					gte: from,
					lte: to,
				};
			} else if (dateFrom || dateTo) {
				where.date = {};
				if (dateFrom) where.date.gte = dateFrom;
				if (dateTo) where.date.lte = dateTo;
			}

			// Type filter
			if (type) {
				where.type = type;
			}

			// Tag filter - uses many-to-many relation
			if (tagId) {
				where.tags = {
					some: {
						tagId,
					},
				};
			}

			// Amount range filter (values are in cents as BigInt)
			if (amountMin || amountMax) {
				where.amountCents = {};
				if (amountMin) where.amountCents.gte = BigInt(amountMin);
				if (amountMax) where.amountCents.lte = BigInt(amountMax);
			}

			// Cursor pagination
			const cursorObj = cursor ? { id: cursor } : undefined;

			// Fetch limit + 1 to determine if there are more items
			const transactions = await db.transaction.findMany({
				where,
				take: limit + 1,
				skip: cursor ? 1 : 0,
				cursor: cursorObj,
				orderBy: { date: "desc" },
				include: {
					tags: {
						include: {
							tag: true,
						},
					},
				},
			});

			// Determine if there are more items
			const hasMore = transactions.length > limit;
			const items = hasMore ? transactions.slice(0, limit) : transactions;
			const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

			return {
				items,
				nextCursor,
			};
		}),

	/**
	 * Get a single transaction by ID
	 */
	getById: protectedProcedure
		.input(z.object({ id: z.string().cuid() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const transaction = await db.transaction.findUnique({
				where: { id: input.id },
				include: {
					tags: {
						include: {
							tag: true,
						},
					},
				},
			});

			if (!transaction) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Transaction not found",
				});
			}

			if (transaction.userId !== userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You don't have permission to view this transaction",
				});
			}

			return transaction;
		}),

	/**
	 * Create a new transaction with optional tags
	 */
	create: protectedProcedure
		.input(createTransactionInput)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const { type, amount, date, description, tagIds } = input;

			// Convert amount string to cents
			const amountCents = displayToCents(amount);

			// Use Prisma transaction for atomicity
			const transaction = await db.$transaction(async (tx) => {
				// Create the transaction
				const created = await tx.transaction.create({
					data: {
						userId,
						type,
						amountCents,
						date,
						description,
					},
				});

				// Create tag associations if provided
				if (tagIds && tagIds.length > 0) {
					await tx.transactionTag.createMany({
						data: tagIds.map((tagId) => ({
							transactionId: created.id,
							tagId,
						})),
					});
				}

				// Return with tags included
				return tx.transaction.findUnique({
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

			return transaction;
		}),

	/**
	 * Update an existing transaction
	 */
	update: protectedProcedure
		.input(updateTransactionInput)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const { id, type, amount, date, description, tagIds } = input;

			// First check ownership
			const existing = await db.transaction.findUnique({
				where: { id },
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Transaction not found",
				});
			}

			if (existing.userId !== userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You don't have permission to update this transaction",
				});
			}

			// Build update data
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const updateData: any = {};
			if (type !== undefined) updateData.type = type;
			if (amount !== undefined) updateData.amountCents = displayToCents(amount);
			if (date !== undefined) updateData.date = date;
			if (description !== undefined) updateData.description = description;

			// Use Prisma transaction for atomicity
			const transaction = await db.$transaction(async (tx) => {
				// Update the transaction
				await tx.transaction.update({
					where: { id },
					data: updateData,
				});

				// If tagIds provided, replace all tag associations
				if (tagIds !== undefined) {
					// Delete existing tags
					await tx.transactionTag.deleteMany({
						where: { transactionId: id },
					});

					// Create new tag associations
					if (tagIds.length > 0) {
						await tx.transactionTag.createMany({
							data: tagIds.map((tagId) => ({
								transactionId: id,
								tagId,
							})),
						});
					}
				}

				// Return with tags included
				return tx.transaction.findUnique({
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

			return transaction;
		}),

	/**
	 * Delete a transaction (hard delete)
	 */
	delete: protectedProcedure
		.input(z.object({ id: z.string().cuid() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// First check ownership
			const existing = await db.transaction.findUnique({
				where: { id: input.id },
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Transaction not found",
				});
			}

			if (existing.userId !== userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You don't have permission to delete this transaction",
				});
			}

			// Hard delete - cascade will handle TransactionTag cleanup
			await db.transaction.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),
});
