import { Injectable, Logger } from '@nestjs/common';
import { MembershipLevel, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembershipService {
  private readonly logger = new Logger(MembershipService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMembershipConfig() {
    return this.prisma.membershipConfig.findMany({
      orderBy: { minGrams: 'asc' },
    });
  }

  async checkAndUpdateMembership(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      return MembershipLevel.NORMAL;
    }

    const configs = await this.getMembershipConfig();
    let nextLevel: MembershipLevel = MembershipLevel.NORMAL;

    for (const config of configs) {
      if (wallet.totalPurchasedGrams.gte(config.minGrams)) {
        nextLevel = config.level;
      }
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return nextLevel;
    }

    if (user.membershipLevel !== nextLevel) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { membershipLevel: nextLevel },
      });
    }

    return nextLevel;
  }

  private async membershipConfigTableExists(): Promise<boolean> {
    try {
      const rows = await this.prisma.$queryRaw<{ exists: boolean }[]>`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = 'MembershipConfig'
        ) AS "exists"
      `;
      return Boolean(rows[0]?.exists);
    } catch (error) {
      this.logger.warn(
        'Could not verify MembershipConfig table existence.',
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  }

  async seedDefaultConfig() {
    const tableReady = await this.membershipConfigTableExists();
    if (!tableReady) {
      this.logger.warn(
        'MembershipConfig table is missing. Skipping default seed. Run: npx prisma migrate deploy',
      );
      return;
    }

    const defaults: Array<{ level: MembershipLevel; minGrams: Prisma.Decimal }> =
      [
        { level: MembershipLevel.NORMAL, minGrams: new Prisma.Decimal(0) },
        { level: MembershipLevel.BRONZE, minGrams: new Prisma.Decimal(10) },
        { level: MembershipLevel.SILVER, minGrams: new Prisma.Decimal(50) },
        { level: MembershipLevel.GOLD, minGrams: new Prisma.Decimal(100) },
      ];

    try {
      for (const item of defaults) {
        await this.prisma.membershipConfig.upsert({
          where: { level: item.level },
          update: {},
          create: item,
        });
      }
      this.logger.log('Membership default config seeded.');
    } catch (error) {
      this.logger.error(
        'Failed to seed MembershipConfig defaults.',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async updateMembershipConfig(
    configs: Array<{ level: MembershipLevel; minGrams: number }>,
  ) {
    for (const config of configs) {
      await this.prisma.membershipConfig.upsert({
        where: { level: config.level },
        update: { minGrams: new Prisma.Decimal(config.minGrams) },
        create: {
          level: config.level,
          minGrams: new Prisma.Decimal(config.minGrams),
        },
      });
    }

    return this.getMembershipConfig();
  }
}
