-- AlterTable
ALTER TABLE "News" ADD COLUMN "coverImageUrl" TEXT;

UPDATE "News"
SET "coverImageUrl" = "imageUrls"[1]
WHERE cardinality("imageUrls") > 0 AND "coverImageUrl" IS NULL;
