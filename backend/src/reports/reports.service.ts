import { Injectable } from '@nestjs/common';
import { MembershipLevel, Prisma, PurchaseStatus, QpayStatus, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GoldPriceService } from '../gold-price/gold-price.service';
import {
  parseMembershipLevel,
  parsePurchaseStatus,
  parseSellStatus,
  parseUserStatus,
  type ReportFilters,
} from './report-filters.type';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly goldPriceService: GoldPriceService,
  ) {}

  private dateRange(startDate?: string, endDate?: string) {
    if (!startDate && !endDate) return undefined;
    return {
      gte: startDate ? new Date(`${startDate}T00:00:00.000Z`) : undefined,
      lte: endDate ? new Date(`${endDate}T23:59:59.999Z`) : undefined,
    };
  }

  private userWhere(filters: ReportFilters): Prisma.UserWhereInput | undefined {
    const parts: Prisma.UserWhereInput[] = [];
    const membership = parseMembershipLevel(filters.membershipLevel);
    const status = parseUserStatus(filters.status);

    if (membership) parts.push({ membershipLevel: membership });
    if (status) parts.push({ status });
    if (filters.userId) parts.push({ id: filters.userId });
    if (filters.userSearch?.trim()) {
      const q = filters.userSearch.trim();
      parts.push({
        OR: [
          { phoneNumber: { contains: q } },
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    if (!parts.length) return undefined;
    return parts.length === 1 ? parts[0] : { AND: parts };
  }

  private purchaseWhere(filters: ReportFilters): Prisma.PurchaseWhereInput {
    const userWhere = this.userWhere(filters);
    const purchaseStatus = parsePurchaseStatus(filters.status);
    return {
      createdAt: this.dateRange(filters.startDate, filters.endDate),
      userId: filters.userId,
      status: purchaseStatus,
      user: userWhere,
    };
  }

  private userWhereWithDate(filters: ReportFilters): Prisma.UserWhereInput | undefined {
    const range = this.dateRange(filters.startDate, filters.endDate);
    const userWhere = this.userWhere(filters);
    if (!userWhere && !range) return undefined;
    return { ...(userWhere ?? {}), ...(range ? { createdAt: range } : {}) };
  }

  private isPaidPurchaseWhere(): Prisma.PurchaseWhereInput {
    return {
      OR: [{ status: PurchaseStatus.COMPLETED }, { qpayStatus: QpayStatus.PAID }],
    };
  }

  private paidPurchaseWhere(filters: ReportFilters): Prisma.PurchaseWhereInput {
    const base = this.purchaseWhere(filters);
    const purchaseStatus = parsePurchaseStatus(filters.status);
    if (purchaseStatus) return base;
    return { AND: [base, this.isPaidPurchaseWhere()] };
  }

  private isPaidPurchase(p: { status: PurchaseStatus; qpayStatus: QpayStatus }) {
    return p.status === PurchaseStatus.COMPLETED || p.qpayStatus === QpayStatus.PAID;
  }

  private sellWhere(filters: ReportFilters): Prisma.SellRequestWhereInput {
    const userWhere = this.userWhere(filters);
    const sellStatus = parseSellStatus(filters.status);
    return {
      createdAt: this.dateRange(filters.startDate, filters.endDate),
      userId: filters.userId,
      status: sellStatus,
      user: userWhere,
    };
  }

  async getSummaryReport(filters: ReportFilters) {
    const range = this.dateRange(filters.startDate, filters.endDate);
    const userWhereWithDate = this.userWhereWithDate(filters);
    const purchaseWhere = this.purchaseWhere(filters);
    const sellWhere = this.sellWhere(filters);
    const paidPurchaseWhere = this.paidPurchaseWhere(filters);

    const [totalUsers, totalPurchases, totalSellRequests, paidPurchases, walletGold, purchaseGramsSum] =
      await Promise.all([
        this.prisma.user.count({ where: userWhereWithDate }),
        this.prisma.purchase.count({ where: purchaseWhere }),
        this.prisma.sellRequest.count({ where: sellWhere }),
        this.prisma.purchase.findMany({
          where: paidPurchaseWhere,
          select: { totalAmountMnt: true },
        }),
        this.prisma.wallet.aggregate({
          where: userWhereWithDate ? { user: userWhereWithDate } : undefined,
          _sum: { balanceGrams: true },
        }),
        this.prisma.purchase.aggregate({
          where: { ...purchaseWhere, status: PurchaseStatus.COMPLETED },
          _sum: { amountGrams: true },
        }),
      ]);

    const totalRevenue = paidPurchases.reduce((sum, p) => sum + p.totalAmountMnt.toNumber(), 0);
    const totalGoldGrams = range
      ? purchaseGramsSum._sum.amountGrams?.toNumber() ?? 0
      : walletGold._sum.balanceGrams?.toNumber() ?? 0;

    return {
      totalUsers,
      totalPurchases,
      totalSellRequests,
      totalGoldGrams,
      totalRevenue,
      periodStart: filters.startDate ?? null,
      periodEnd: filters.endDate ?? null,
    };
  }

  async getPurchaseReport(filters: ReportFilters) {
    const purchases = await this.prisma.purchase.findMany({
      where: this.purchaseWhere(filters),
      orderBy: { createdAt: 'asc' },
    });

    const totalPurchases = purchases.length;
    const totalGramsSold = purchases.reduce((s, p) => s + p.amountGrams.toNumber(), 0);
    const totalRevenue = purchases
      .filter((p) => this.isPaidPurchase(p))
      .reduce((s, p) => s + p.totalAmountMnt.toNumber(), 0);
    const successfulCount = purchases.filter((p) => this.isPaidPurchase(p)).length;
    const failedCount = purchases.filter(
      (p) => p.qpayStatus === 'FAILED' || p.status === PurchaseStatus.CANCELLED,
    ).length;

    const grouped = new Map<string, { count: number; grams: number; revenue: number }>();
    for (const p of purchases) {
      const date = p.createdAt.toISOString().slice(0, 10);
      const curr = grouped.get(date) ?? { count: 0, grams: 0, revenue: 0 };
      curr.count += 1;
      curr.grams += p.amountGrams.toNumber();
      if (this.isPaidPurchase(p)) {
        curr.revenue += p.totalAmountMnt.toNumber();
      }
      grouped.set(date, curr);
    }

    return {
      totalPurchases,
      totalGramsSold,
      totalRevenue,
      successfulCount,
      failedCount,
      dailyBreakdown: Array.from(grouped.entries()).map(([date, data]) => ({ date, ...data })),
    };
  }

  async getSellReport(filters: ReportFilters) {
    const sells = await this.prisma.sellRequest.findMany({
      where: this.sellWhere(filters),
      orderBy: { createdAt: 'asc' },
    });

    const totalRequests = sells.length;
    const totalGrams = sells.reduce((s, r) => s + r.amountGrams.toNumber(), 0);
    const totalAmount = sells.reduce((s, r) => s + (r.totalAmountMnt?.toNumber() ?? 0), 0);
    const completedCount = sells.filter((r) => r.status === 'COMPLETED').length;
    const pendingCount = sells.filter((r) => r.status === 'PENDING').length;

    const grouped = new Map<string, { count: number; grams: number; amount: number }>();
    for (const r of sells) {
      const date = r.createdAt.toISOString().slice(0, 10);
      const curr = grouped.get(date) ?? { count: 0, grams: 0, amount: 0 };
      curr.count += 1;
      curr.grams += r.amountGrams.toNumber();
      curr.amount += r.totalAmountMnt?.toNumber() ?? 0;
      grouped.set(date, curr);
    }

    return {
      totalRequests,
      totalGrams,
      totalAmount,
      completedCount,
      pendingCount,
      dailyBreakdown: Array.from(grouped.entries()).map(([date, data]) => ({ date, ...data })),
    };
  }

  async getRevenueReport(filters: ReportFilters) {
    const purchases = await this.prisma.purchase.findMany({
      where: this.paidPurchaseWhere(filters),
      orderBy: { createdAt: 'asc' },
    });

    const grouped = new Map<string, { revenue: number; count: number }>();
    for (const p of purchases) {
      const date = (p.paidAt ?? p.createdAt).toISOString().slice(0, 10);
      const curr = grouped.get(date) ?? { revenue: 0, count: 0 };
      curr.revenue += p.totalAmountMnt.toNumber();
      curr.count += 1;
      grouped.set(date, curr);
    }

    const totalRevenue = purchases.reduce((s, p) => s + p.totalAmountMnt.toNumber(), 0);

    return {
      totalRevenue,
      totalTransactions: purchases.length,
      dailyBreakdown: Array.from(grouped.entries()).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        count: data.count,
      })),
    };
  }

  async getUserReport(filters: ReportFilters) {
    const userWhereWithDate = this.userWhereWithDate(filters);

    const [totalUsers, newUsers, kycVerifiedCount, activeCount, suspendedCount] = await Promise.all([
      this.prisma.user.count({ where: userWhereWithDate }),
      this.prisma.user.findMany({
        where: userWhereWithDate,
        select: { createdAt: true, membershipLevel: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.user.count({ where: { ...userWhereWithDate, kycStatus: 'VERIFIED' } }),
      this.prisma.user.count({ where: { ...userWhereWithDate, status: UserStatus.ACTIVE } }),
      this.prisma.user.count({ where: { ...userWhereWithDate, status: UserStatus.SUSPENDED } }),
    ]);

    const membershipDistribution = {
      NORMAL: await this.prisma.user.count({
        where: { ...userWhereWithDate, membershipLevel: MembershipLevel.NORMAL },
      }),
      BRONZE: await this.prisma.user.count({
        where: { ...userWhereWithDate, membershipLevel: MembershipLevel.BRONZE },
      }),
      SILVER: await this.prisma.user.count({
        where: { ...userWhereWithDate, membershipLevel: MembershipLevel.SILVER },
      }),
      GOLD: await this.prisma.user.count({
        where: { ...userWhereWithDate, membershipLevel: MembershipLevel.GOLD },
      }),
    };

    const grouped = new Map<string, number>();
    for (const user of newUsers) {
      const date = user.createdAt.toISOString().slice(0, 10);
      grouped.set(date, (grouped.get(date) ?? 0) + 1);
    }

    return {
      totalUsers,
      newRegistrations: newUsers.length,
      kycVerifiedCount,
      activeCount,
      suspendedCount,
      membershipDistribution,
      dailyBreakdown: Array.from(grouped.entries()).map(([date, count]) => ({ date, count })),
    };
  }

  async getGoldMovementReport(filters: ReportFilters) {
    const userWhereWithDate = this.userWhereWithDate(filters);
    const purchaseWhere = this.purchaseWhere({ ...filters, status: PurchaseStatus.COMPLETED });
    const sellWhere = this.sellWhere({ ...filters, status: 'COMPLETED' });

    const [purchases, sells, topUsersByBalance, totalSystemGold] = await Promise.all([
      this.prisma.purchase.findMany({ where: purchaseWhere }),
      this.prisma.sellRequest.findMany({ where: sellWhere }),
      this.prisma.wallet.findMany({
        where: userWhereWithDate ? { user: userWhereWithDate } : undefined,
        orderBy: { balanceGrams: 'desc' },
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              phoneNumber: true,
              firstName: true,
              lastName: true,
              membershipLevel: true,
            },
          },
        },
      }),
      this.prisma.wallet.aggregate({
        where: userWhereWithDate ? { user: userWhereWithDate } : undefined,
        _sum: { balanceGrams: true },
      }),
    ]);

    const totalPurchasedGrams = purchases.reduce((s, p) => s + p.amountGrams.toNumber(), 0);
    const totalSoldGrams = sells.reduce((s, p) => s + p.amountGrams.toNumber(), 0);

    return {
      totalPurchasedGrams,
      totalSoldGrams,
      netGoldInSystem: totalSystemGold._sum.balanceGrams?.toNumber() ?? 0,
      topUsersByBalance: topUsersByBalance.map((w) => ({
        ...w,
        balanceGrams: w.balanceGrams.toNumber(),
        totalPurchasedGrams: w.totalPurchasedGrams.toNumber(),
      })),
    };
  }

  async getDashboardStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [todayNewUsers, todayPurchaseRows, totalActiveUsers, wallets, pendingSellRequests, currentGoldPrice] =
      await Promise.all([
        this.prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),
        this.prisma.purchase.findMany({
          where: {
            createdAt: { gte: startOfDay },
            status: PurchaseStatus.COMPLETED,
          },
        }),
        this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
        this.prisma.wallet.findMany(),
        this.prisma.sellRequest.count({ where: { status: 'PENDING' } }),
        this.goldPriceService.getCurrentPrice(),
      ]);

    const todayRevenue = todayPurchaseRows.reduce(
      (s, p) => s + p.totalAmountMnt.toNumber(),
      0,
    );
    const totalGoldInSystem = wallets.reduce(
      (s, w) => s + w.balanceGrams.toNumber(),
      0,
    );

    return {
      todayNewUsers,
      todayPurchases: {
        count: todayPurchaseRows.length,
        revenue: todayRevenue,
      },
      totalActiveUsers,
      totalGoldInSystem,
      pendingSellRequests,
      currentGoldPrice,
    };
  }
}
