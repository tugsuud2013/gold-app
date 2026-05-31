-- AlterTable
ALTER TABLE "SellRequest" ADD COLUMN "requestNo" TEXT;
ALTER TABLE "SellRequest" ADD COLUMN "pricePerGram" DECIMAL(15,2);
ALTER TABLE "SellRequest" ADD COLUMN "totalAmountMnt" DECIMAL(15,2);

-- CreateIndex
CREATE UNIQUE INDEX "SellRequest_requestNo_key" ON "SellRequest"("requestNo");
