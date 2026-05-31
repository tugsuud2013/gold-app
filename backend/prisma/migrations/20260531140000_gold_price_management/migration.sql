-- AlterTable
ALTER TABLE "GoldPrice" ADD COLUMN "mongolBankPrice" DECIMAL(15,2);
ALTER TABLE "GoldPrice" ADD COLUMN "buyPrice" DECIMAL(15,2);
ALTER TABLE "GoldPrice" ADD COLUMN "sellPrice" DECIMAL(15,2);
ALTER TABLE "GoldPrice" ADD COLUMN "changePercent" DECIMAL(8,4);
ALTER TABLE "GoldPrice" ADD COLUMN "note" TEXT;
ALTER TABLE "GoldPrice" ADD COLUMN "adminId" TEXT;

UPDATE "GoldPrice"
SET
  "mongolBankPrice" = "pricePerGram",
  "buyPrice" = "pricePerGram" - 1000,
  "sellPrice" = "pricePerGram" + 1000;

ALTER TABLE "GoldPrice" ALTER COLUMN "mongolBankPrice" SET NOT NULL;
ALTER TABLE "GoldPrice" ALTER COLUMN "buyPrice" SET NOT NULL;
ALTER TABLE "GoldPrice" ALTER COLUMN "sellPrice" SET NOT NULL;

ALTER TABLE "GoldPrice" ADD CONSTRAINT "GoldPrice_adminId_fkey"
  FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
