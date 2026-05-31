import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole, PurchaseStatus, Prisma, QpayStatus } from '@prisma/client';
import type { Response } from 'express';
import { join } from 'path';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../auth/guards/admin-roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { successResponse } from '../common/response.helper';

@Controller('admin/purchases')
@UseGuards(JwtAuthGuard, AdminRolesGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
@ApiTags('Admin')
@ApiBearerAuth()
export class AdminPurchasesController {
  constructor(private readonly prisma: PrismaService) {}

  private buildPurchaseWhere(
    userId?: string,
    startDate?: string,
    endDate?: string,
  ): Prisma.PurchaseWhereInput {
    return {
      userId: userId || undefined,
      createdAt:
        startDate || endDate
          ? {
              gte: startDate ? new Date(startDate) : undefined,
              lte: endDate ? new Date(endDate) : undefined,
            }
          : undefined,
    };
  }

  @Get('stats')
  async getPurchaseStats(
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const where = this.buildPurchaseWhere(userId, startDate, endDate);

    const [total, pending, paid, completed, cancelled] = await Promise.all([
      this.prisma.purchase.count({ where }),
      this.prisma.purchase.count({
        where: {
          ...where,
          status: { notIn: [PurchaseStatus.COMPLETED, PurchaseStatus.CANCELLED] },
          qpayStatus: { not: QpayStatus.PAID },
        },
      }),
      this.prisma.purchase.count({
        where: {
          ...where,
          qpayStatus: QpayStatus.PAID,
          status: { notIn: [PurchaseStatus.COMPLETED, PurchaseStatus.CANCELLED] },
        },
      }),
      this.prisma.purchase.count({ where: { ...where, status: PurchaseStatus.COMPLETED } }),
      this.prisma.purchase.count({ where: { ...where, status: PurchaseStatus.CANCELLED } }),
    ]);

    return successResponse('Admin purchase stats fetched', {
      total,
      pending,
      paid,
      completed,
      cancelled,
    });
  }

  @Get()
  async getPurchases(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: PurchaseStatus,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const safePage = Math.max(1, Number(page ?? 1));
    const safeLimit = Math.min(100, Math.max(1, Number(limit ?? 20)));
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.PurchaseWhereInput = {
      ...this.buildPurchaseWhere(userId, startDate, endDate),
      status: status as PurchaseStatus | undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.purchase.count({ where }),
    ]);

    return successResponse('Admin purchases fetched', {
      page: safePage,
      limit: safeLimit,
      total,
      items,
    });
  }

  @Get(':id')
  async getPurchaseById(@Param('id') id: string) {
    const data = await this.prisma.purchase.findUnique({
      where: { id },
      include: { user: true },
    });
    return successResponse('Admin purchase fetched', data);
  }

  @Get(':id/contract')
  async getContract(@Param('id') id: string, @Res() res: Response) {
    const path = join(process.cwd(), 'uploads', 'contracts', `${id}.pdf`);
    return res.sendFile(path);
  }
}
