import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getWalletByUserId(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) {
      throw new NotFoundException({
        message: 'Wallet not found',
        errorCode: 'WALLET_NOT_FOUND',
      });
    }
    return wallet;
  }

  async createWalletForUser(userId: string) {
    return this.prisma.wallet.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  async addGrams(
    userId: string,
    grams: number | string,
    referenceId?: string,
    note?: string,
  ) {
    const amount = new Prisma.Decimal(grams);
    if (amount.lte(0)) {
      throw new BadRequestException({
        message: 'Amount must be greater than zero',
        errorCode: 'INVALID_AMOUNT',
      });
    }

    const wallet = await this.createWalletForUser(userId);
    const balanceBefore = wallet.balanceGrams;
    const balanceAfter = balanceBefore.plus(amount);

    const updated = await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balanceGrams: balanceAfter,
        totalPurchasedGrams: wallet.totalPurchasedGrams.plus(amount),
      },
    });

    await this.prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: TransactionType.PURCHASE,
        amountGrams: amount,
        balanceBefore,
        balanceAfter,
        referenceId,
        note,
      },
    });

    return updated;
  }

  async deductGrams(
    userId: string,
    grams: number | string,
    referenceId?: string,
    note?: string,
  ) {
    const amount = new Prisma.Decimal(grams);
    if (amount.lte(0)) {
      throw new BadRequestException({
        message: 'Amount must be greater than zero',
        errorCode: 'INVALID_AMOUNT',
      });
    }

    const wallet = await this.getWalletByUserId(userId);
    if (wallet.balanceGrams.lt(amount)) {
      throw new BadRequestException({
        message: 'Insufficient balance',
        errorCode: 'INSUFFICIENT_BALANCE',
      });
    }

    const balanceBefore = wallet.balanceGrams;
    const balanceAfter = balanceBefore.minus(amount);

    const updated = await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balanceGrams: balanceAfter,
        totalSoldGrams: wallet.totalSoldGrams.plus(amount),
      },
    });

    await this.prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: TransactionType.SELL_DEDUCT,
        amountGrams: amount,
        balanceBefore,
        balanceAfter,
        referenceId,
        note,
      },
    });

    return updated;
  }

  async getTransactions(userId: string, page = 1, limit = 20) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;
    const wallet = await this.getWalletByUserId(userId);
    const [items, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.walletTransaction.count({
        where: { walletId: wallet.id },
      }),
    ]);

    return {
      page: safePage,
      limit: safeLimit,
      total,
      items,
    };
  }
}
