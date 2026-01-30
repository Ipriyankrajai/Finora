import { env } from "@finora2/env/server";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../prisma/generated/client";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export default prisma;

// Re-export Prisma enums and types for use in other packages
export { TransactionType, InterestType } from "../prisma/generated/enums";
export type {
  TransactionModel as Transaction,
  TagModel as Tag,
  TransactionTagModel as TransactionTag,
  LoanModel as Loan,
  LoanPaymentModel as LoanPayment,
} from "../prisma/generated/models";
