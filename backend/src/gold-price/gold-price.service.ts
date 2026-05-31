import { BadRequestException, Injectable } from '@nestjs/common';
import { GoldPrice, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type PriceFilter = '1d' | '7d' | '30d' | '90d' | '1m' | '6m' | '1y';

type GoldPriceWithAdmin = GoldPrice & {
  admin?: { id: string; name: string; email: string } | null;
};

const adminInclude = {
  admin: { select: { id: true, name: true, email: true } },
} as const;

@Injectable()
export class GoldPriceService {
  constructor(private readonly prisma: PrismaService) {}

  private getBankPrice(record: Pick<GoldPrice, 'mongolBankPrice' | 'pricePerGram'>) {
    return Number(record.mongolBankPrice ?? record.pricePerGram ?? 0);
  }

  private deriveBuySell(bank: number, buy?: Prisma.Decimal | number | null, sell?: Prisma.Decimal | number | null) {
    const buyNum = buy != null ? Number(buy) : 0;
    const sellNum = sell != null ? Number(sell) : 0;
    return {
      buyPrice: buyNum > 0 ? buyNum : Math.max(1, bank - 1000),
      sellPrice: sellNum > 0 ? sellNum : bank + 1000,
    };
  }

  private normalizeRecord(record: GoldPriceWithAdmin) {
    const bank = this.getBankPrice(record);
    const { buyPrice, sellPrice } = this.deriveBuySell(bank, record.buyPrice, record.sellPrice);

    return {
      ...record,
      pricePerGram: bank,
      mongolBankPrice: bank,
      buyPrice,
      sellPrice,
    };
  }

  private computeChangePercent(current: number, previous: number | null) {
    if (previous == null || previous === 0) return null;
    return Number((((current - previous) / previous) * 100).toFixed(4));
  }

  async getCurrentPrice() {
    const [latest, previous] = await Promise.all([
      this.prisma.goldPrice.findFirst({
        orderBy: { createdAt: 'desc' },
        include: adminInclude,
      }),
      this.prisma.goldPrice.findFirst({
        orderBy: { createdAt: 'desc' },
        skip: 1,
      }),
    ]);

    if (!latest) return null;

    const bank = this.getBankPrice(latest);
    const prevBank = previous ? this.getBankPrice(previous) : null;
    const changePercent = this.computeChangePercent(bank, prevBank);

    return {
      ...latest,
      pricePerGram: bank,
      mongolBankPrice: bank,
      buyPrice: Number(latest.buyPrice),
      sellPrice: Number(latest.sellPrice),
      changePercent,
      updatedAt: latest.createdAt,
      admin: latest.admin ?? null,
    };
  }

  async getPriceHistory(filter: PriceFilter) {
    const now = new Date();
    const from = new Date(now);

    if (filter === '1d') from.setDate(from.getDate() - 1);
    else if (filter === '7d') from.setDate(from.getDate() - 7);
    else if (filter === '30d') from.setDate(from.getDate() - 30);
    else if (filter === '90d') from.setDate(from.getDate() - 90);
    else if (filter === '1m') from.setMonth(from.getMonth() - 1);
    else if (filter === '6m') from.setMonth(from.getMonth() - 6);
    else if (filter === '1y') from.setFullYear(from.getFullYear() - 1);

    const prices = await this.prisma.goldPrice.findMany({
      where: { createdAt: { gte: from } },
      orderBy: { createdAt: 'asc' },
      select: {
        mongolBankPrice: true,
        buyPrice: true,
        sellPrice: true,
        pricePerGram: true,
        changePercent: true,
        createdAt: true,
      },
    });

    return prices.map((row) => {
      const bank = this.getBankPrice(row);
      const { buyPrice, sellPrice } = this.deriveBuySell(bank, row.buyPrice, row.sellPrice);
      return {
        ...row,
        mongolBankPrice: bank,
        buyPrice,
        sellPrice,
      };
    });
  }

  private validatePrices(mongolBankPrice: number, buyPrice: number, sellPrice: number) {
    if (buyPrice > mongolBankPrice) {
      throw new BadRequestException('Авах үнэ Монголбанкны үнээс их байж болохгүй');
    }
    if (sellPrice < buyPrice) {
      throw new BadRequestException('Зарах үнэ авах үнээс бага байж болохгүй');
    }
  }

  async addPrice(input: {
    mongolBankPrice: number;
    buyPrice: number;
    sellPrice: number;
    note?: string;
    adminId?: string;
    source?: string;
  }) {
    this.validatePrices(input.mongolBankPrice, input.buyPrice, input.sellPrice);

    const prev = await this.prisma.goldPrice.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    const prevBank = prev ? this.getBankPrice(prev) : null;
    const changePercent = this.computeChangePercent(input.mongolBankPrice, prevBank);

    const created = await this.prisma.goldPrice.create({
      data: {
        pricePerGram: new Prisma.Decimal(input.mongolBankPrice),
        mongolBankPrice: new Prisma.Decimal(input.mongolBankPrice),
        buyPrice: new Prisma.Decimal(input.buyPrice),
        sellPrice: new Prisma.Decimal(input.sellPrice),
        changePercent: changePercent != null ? new Prisma.Decimal(changePercent) : null,
        note: input.note?.trim() || null,
        adminId: input.adminId ?? null,
        source: input.source ?? 'MANUAL',
      },
      include: adminInclude,
    });

    return this.normalizeRecord(created);
  }

  async getAdminHistory(page = 1, limit = 30) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(400, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;
    const [items, total] = await Promise.all([
      this.prisma.goldPrice.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
        include: adminInclude,
      }),
      this.prisma.goldPrice.count(),
    ]);

    const normalized = items.map((item) => ({
      ...this.normalizeRecord(item),
      changePercent: item.changePercent != null ? Number(item.changePercent) : null,
    }));

    return { page: safePage, limit: safeLimit, total, items: normalized };
  }

  async seedTestData() {
    const count = await this.prisma.goldPrice.count();
    if (count > 0) {
      return;
    }

    const entries: Array<{
      pricePerGram: Prisma.Decimal;
      mongolBankPrice: Prisma.Decimal;
      buyPrice: Prisma.Decimal;
      sellPrice: Prisma.Decimal;
      changePercent: Prisma.Decimal | null;
      source: string;
      createdAt: Date;
    }> = [];

    let price = 320000;
    const today = new Date();
    let prevPrice: number | null = null;

    for (let i = 364; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const fluctuation = Math.random() * 0.04 - 0.02;
      price = Math.max(100000, price * (1 + fluctuation));
      const bank = Number(price.toFixed(2));
      const buy = bank - 1000;
      const sell = bank + 1000;
      const changePercent =
        prevPrice != null ? this.computeChangePercent(bank, prevPrice) : null;

      entries.push({
        pricePerGram: new Prisma.Decimal(bank),
        mongolBankPrice: new Prisma.Decimal(bank),
        buyPrice: new Prisma.Decimal(buy),
        sellPrice: new Prisma.Decimal(sell),
        changePercent: changePercent != null ? new Prisma.Decimal(changePercent) : null,
        source: 'SEED',
        createdAt: date,
      });
      prevPrice = bank;
    }

    await this.prisma.goldPrice.createMany({
      data: entries,
    });
  }
}
