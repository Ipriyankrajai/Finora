-- CreateEnum
CREATE TYPE "RecurringFrequency" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "RecurringStatus" AS ENUM ('ACTIVE', 'PAUSED');

-- CreateEnum
CREATE TYPE "OccurrenceStatus" AS ENUM ('GENERATED', 'SKIPPED');

-- CreateTable
CREATE TABLE "recurring_rule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL DEFAULT 'EXPENSE',
    "amountCents" BIGINT NOT NULL,
    "description" TEXT,
    "frequency" "RecurringFrequency" NOT NULL,
    "dayOfWeek" INTEGER,
    "dayOfMonth" INTEGER,
    "startDate" TIMESTAMPTZ(3) NOT NULL,
    "endDate" TIMESTAMPTZ(3),
    "maxOccurrences" INTEGER,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "status" "RecurringStatus" NOT NULL DEFAULT 'ACTIVE',
    "nextOccurrenceDate" TIMESTAMPTZ(3) NOT NULL,
    "lastGeneratedDate" TIMESTAMPTZ(3),
    "currencyCode" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "recurring_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_rule_tag" (
    "ruleId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "assignedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurring_rule_tag_pkey" PRIMARY KEY ("ruleId","tagId")
);

-- CreateTable
CREATE TABLE "recurring_occurrence" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMPTZ(3) NOT NULL,
    "status" "OccurrenceStatus" NOT NULL DEFAULT 'GENERATED',
    "transactionId" TEXT,
    "generatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurring_occurrence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recurring_rule_userId_status_idx" ON "recurring_rule"("userId", "status");

-- CreateIndex
CREATE INDEX "recurring_rule_status_nextOccurrenceDate_idx" ON "recurring_rule"("status", "nextOccurrenceDate");

-- CreateIndex
CREATE INDEX "recurring_rule_tag_tagId_idx" ON "recurring_rule_tag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "recurring_occurrence_transactionId_key" ON "recurring_occurrence"("transactionId");

-- CreateIndex
CREATE INDEX "recurring_occurrence_ruleId_status_idx" ON "recurring_occurrence"("ruleId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "recurring_occurrence_ruleId_scheduledDate_key" ON "recurring_occurrence"("ruleId", "scheduledDate");

-- AddForeignKey
ALTER TABLE "recurring_rule" ADD CONSTRAINT "recurring_rule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_rule_tag" ADD CONSTRAINT "recurring_rule_tag_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "recurring_rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_rule_tag" ADD CONSTRAINT "recurring_rule_tag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_occurrence" ADD CONSTRAINT "recurring_occurrence_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "recurring_rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_occurrence" ADD CONSTRAINT "recurring_occurrence_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
