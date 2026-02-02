import { env } from "@finora2/env/server";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../prisma/generated/client";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export default prisma;

// biome-ignore lint/performance/noBarrelFile: Intentional re-exports for db package API
export { InterestType, TransactionType } from "../prisma/generated/enums";
export type {
	LoanModel as Loan,
	LoanPaymentModel as LoanPayment,
	TagModel as Tag,
	TransactionModel as Transaction,
	TransactionTagModel as TransactionTag,
} from "../prisma/generated/models";
