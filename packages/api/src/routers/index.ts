import { protectedProcedure, publicProcedure, router } from "../index";
import { dashboardRouter } from "./dashboard";
import { loanRouter } from "./loan";
import { tagRouter } from "./tag";
import { transactionRouter } from "./transaction";

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
  tag: tagRouter,
  transaction: transactionRouter,
});
export type AppRouter = typeof appRouter;
