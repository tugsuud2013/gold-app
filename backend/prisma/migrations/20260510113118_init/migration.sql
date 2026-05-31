-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MembershipLevel" AS ENUM ('NORMAL', 'BRONZE', 'SILVER', 'GOLD');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PURCHASE', 'SELL_DEDUCT', 'ADMIN_ADJUST');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'CONTRACT_SIGNED', 'PAYMENT_PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QpayStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SellRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'OPERATOR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "registerNumber" TEXT,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "signatureImageUrl" TEXT,
    "membershipLevel" "MembershipLevel" NOT NULL DEFAULT 'NORMAL',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "isChatBanned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balanceGrams" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "totalPurchasedGrams" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "totalSoldGrams" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amountGrams" DECIMAL(10,4) NOT NULL,
    "balanceBefore" DECIMAL(10,4) NOT NULL,
    "balanceAfter" DECIMAL(10,4) NOT NULL,
    "referenceId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountGrams" DECIMAL(10,4) NOT NULL,
    "pricePerGram" DECIMAL(15,2) NOT NULL,
    "totalAmountMnt" DECIMAL(15,2) NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "contractPdfUrl" TEXT,
    "contractQrCode" TEXT,
    "qpayInvoiceId" TEXT,
    "qpayStatus" "QpayStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountGrams" DECIMAL(10,4) NOT NULL,
    "status" "SellRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "processedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoldPrice" (
    "id" TEXT NOT NULL,
    "pricePerGram" DECIMAL(15,2) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoldPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrls" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipConfig" (
    "id" TEXT NOT NULL,
    "level" "MembershipLevel" NOT NULL,
    "minGrams" DECIMAL(10,4) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'OPERATOR',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "adminId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "ipAddress" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_registerNumber_key" ON "User"("registerNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MembershipConfig_level_key" ON "MembershipConfig"("level");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellRequest" ADD CONSTRAINT "SellRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
