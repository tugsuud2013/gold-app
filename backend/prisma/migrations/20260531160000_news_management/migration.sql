-- CreateEnum
CREATE TYPE "NewsStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "News" ADD COLUMN "summary" TEXT;
ALTER TABLE "News" ADD COLUMN "status" "NewsStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "News" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "News" ADD COLUMN "slug" TEXT;
ALTER TABLE "News" ADD COLUMN "metaTitle" TEXT;
ALTER TABLE "News" ADD COLUMN "metaDescription" TEXT;
ALTER TABLE "News" ADD COLUMN "adminId" TEXT;

UPDATE "News" SET "status" = 'PUBLISHED' WHERE "isPublished" = true;
UPDATE "News" SET "status" = 'DRAFT' WHERE "isPublished" = false;

CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");

ALTER TABLE "News" ADD CONSTRAINT "News_adminId_fkey"
  FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
