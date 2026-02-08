import prisma from "@finora2/db";
import { TRPCError } from "@trpc/server";

import { protectedProcedure, router } from "../index";
import { updateCurrencyInput, updateProfileInput } from "../schemas/user";

export const userRouter = router({
	getSettings: protectedProcedure.query(async ({ ctx }) => {
		const user = await prisma.user.findUnique({
			where: { id: ctx.session.user.id },
			select: {
				id: true,
				name: true,
				email: true,
				currencyCode: true,
				hasCompletedOnboarding: true,
			},
		});

		if (!user) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "User not found",
			});
		}

		return user;
	}),

	updateProfile: protectedProcedure
		.input(updateProfileInput)
		.mutation(async ({ ctx, input }) => {
			return await prisma.user.update({
				where: { id: ctx.session.user.id },
				data: { name: input.name },
			});
		}),

	updateCurrency: protectedProcedure
		.input(updateCurrencyInput)
		.mutation(async ({ ctx, input }) => {
			return await prisma.user.update({
				where: { id: ctx.session.user.id },
				data: { currencyCode: input.currencyCode },
			});
		}),

	completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
		return await prisma.user.update({
			where: { id: ctx.session.user.id },
			data: { hasCompletedOnboarding: true },
		});
	}),
});
