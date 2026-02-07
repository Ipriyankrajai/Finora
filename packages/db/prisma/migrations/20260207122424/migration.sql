-- AlterTable
ALTER TABLE "user" ADD COLUMN     "currencySymbol" TEXT NOT NULL DEFAULT '$',
ADD COLUMN     "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT true;
