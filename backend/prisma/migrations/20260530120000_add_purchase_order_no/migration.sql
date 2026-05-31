-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN "orderNo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_orderNo_key" ON "Purchase"("orderNo");
