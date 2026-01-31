import prisma from "@finora2/db";
import { TRPCError } from "@trpc/server";

import { protectedProcedure, router } from "../index";
import { createTagInput, deleteTagInput, updateTagInput } from "../schemas/tag";

export const tagRouter = router({
	list: protectedProcedure.query(async ({ ctx }) => {
		return prisma.tag.findMany({
			where: {
				userId: ctx.session.user.id,
				isActive: true,
			},
			orderBy: { name: "asc" },
		});
	}),

	create: protectedProcedure
		.input(createTagInput)
		.mutation(async ({ ctx, input }) => {
			return prisma.tag.create({
				data: {
					userId: ctx.session.user.id,
					name: input.name,
					color: input.color,
				},
			});
		}),

	update: protectedProcedure
		.input(updateTagInput)
		.mutation(async ({ ctx, input }) => {
			const tag = await prisma.tag.findUnique({
				where: { id: input.id },
			});

			if (!tag) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Tag not found",
				});
			}

			if (tag.userId !== ctx.session.user.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You do not have access to this tag",
				});
			}

			return prisma.tag.update({
				where: { id: input.id },
				data: {
					...(input.name && { name: input.name }),
					...(input.color && { color: input.color }),
				},
			});
		}),

	delete: protectedProcedure
		.input(deleteTagInput)
		.mutation(async ({ ctx, input }) => {
			const tag = await prisma.tag.findUnique({
				where: { id: input.id },
			});

			if (!tag) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Tag not found",
				});
			}

			if (tag.userId !== ctx.session.user.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You do not have access to this tag",
				});
			}

			// Soft delete per Phase 1 schema
			return prisma.tag.update({
				where: { id: input.id },
				data: { isActive: false },
			});
		}),
});
