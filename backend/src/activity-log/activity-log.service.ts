import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface LogInput {
  userId?: string;
  adminId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: LogInput) {
    return this.prisma.activityLog.create({
      data: {
        userId: data.userId,
        adminId: data.adminId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        ipAddress: data.ipAddress,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async getAdminLogs(page = 1, limit = 50, adminId?: string) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(200, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;
    const where = adminId ? { adminId } : undefined;

    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return { page: safePage, limit: safeLimit, total, items };
  }
}
