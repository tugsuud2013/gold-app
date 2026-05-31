-- CreateEnum
CREATE TYPE "ChatThreadStatus" AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE "ChatSenderType" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN "senderType" "ChatSenderType" NOT NULL DEFAULT 'USER';
ALTER TABLE "ChatMessage" ADD COLUMN "adminId" TEXT;

-- CreateTable
CREATE TABLE "ChatThread" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ChatThreadStatus" NOT NULL DEFAULT 'OPEN',
    "adminLastReadAt" TIMESTAMP(3),
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageText" TEXT,
    "unreadByAdmin" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatThread_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatThread_userId_key" ON "ChatThread"("userId");

-- AddForeignKey
ALTER TABLE "ChatThread" ADD CONSTRAINT "ChatThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill threads from existing messages
INSERT INTO "ChatThread" ("id", "userId", "status", "lastMessageAt", "lastMessageText", "unreadByAdmin", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    grouped."userId",
    'OPEN',
    grouped."lastMessageAt",
    grouped."lastMessageText",
    grouped."msgCount",
    grouped."lastMessageAt",
    grouped."lastMessageAt"
FROM (
    SELECT
        m."userId",
        MAX(m."createdAt") AS "lastMessageAt",
        (ARRAY_AGG(m."message" ORDER BY m."createdAt" DESC))[1] AS "lastMessageText",
        COUNT(*)::int AS "msgCount"
    FROM "ChatMessage" m
    GROUP BY m."userId"
) grouped
ON CONFLICT ("userId") DO NOTHING;
