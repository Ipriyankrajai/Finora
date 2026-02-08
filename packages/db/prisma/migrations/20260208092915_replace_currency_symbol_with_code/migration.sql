-- Step 1: Add currencyCode column with default
ALTER TABLE "user" ADD COLUMN "currencyCode" TEXT NOT NULL DEFAULT 'USD';

-- Step 2: Migrate existing symbol data to ISO codes
UPDATE "user" SET "currencyCode" = CASE "currencySymbol"
  WHEN '$' THEN 'USD'
  WHEN '£' THEN 'GBP'
  WHEN '€' THEN 'EUR'
  WHEN '¥' THEN 'JPY'
  WHEN '₹' THEN 'INR'
  WHEN 'A$' THEN 'AUD'
  WHEN 'C$' THEN 'CAD'
  WHEN 'CHF' THEN 'CHF'
  WHEN 'R$' THEN 'BRL'
  WHEN '₩' THEN 'KRW'
  ELSE 'USD'
END;

-- Step 3: Drop the old column
ALTER TABLE "user" DROP COLUMN "currencySymbol";
