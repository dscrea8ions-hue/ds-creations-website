-- Backfill Product.sku to DSC-###### and add an atomic allocator.
-- Existing valid DSC SKUs are preserved; invalid values are assigned deterministically.
CREATE TABLE "ProductSkuCounter" (
  "key" TEXT NOT NULL,
  "lastValue" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductSkuCounter_pkey" PRIMARY KEY ("key")
);

WITH "validMaximum" AS (
  SELECT COALESCE(MAX(SUBSTRING("sku" FROM 5 FOR 6)::INTEGER), 0) AS "value"
  FROM "Product"
  WHERE "sku" ~ '^DSC-[0-9]{6}$'
),
"backfill" AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) AS "position"
  FROM "Product"
  WHERE "sku" !~ '^DSC-[0-9]{6}$'
)
UPDATE "Product" AS "product"
SET "sku" = 'DSC-' || LPAD(("validMaximum"."value" + "backfill"."position")::TEXT, 6, '0')
FROM "validMaximum", "backfill"
WHERE "product"."id" = "backfill"."id";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Product"
    WHERE "sku" !~ '^DSC-[0-9]{6}$'
       OR SUBSTRING("sku" FROM 5 FOR 6)::INTEGER > 999999
  ) THEN
    RAISE EXCEPTION 'Product SKU backfill exceeded the DSC six-digit range';
  END IF;
END $$;

INSERT INTO "ProductSkuCounter" ("key", "lastValue", "updatedAt")
SELECT
  'product',
  COALESCE(MAX(SUBSTRING("sku" FROM 5 FOR 6)::INTEGER), 0),
  CURRENT_TIMESTAMP
FROM "Product";
