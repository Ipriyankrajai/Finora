import { protectedProcedure, publicProcedure, router } from "../index";
import { dashboardRouter } from "./dashboard";
import { loanRouter } from "./loan";
import { recurringRouter } from "./recurring";
import { tagRouter } from "./tag";
import { transactionRouter } from "./transaction";
import { userRouter } from "./user";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	dashboard: dashboardRouter,
	loan: loanRouter,
	recurring: recurringRouter,
	tag: tagRouter,
	transaction: transactionRouter,
	user: userRouter,
});
export type AppRouter = typeof appRouter;
