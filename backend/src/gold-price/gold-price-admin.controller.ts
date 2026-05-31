import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import type { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../auth/guards/admin-roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { successResponse } from '../common/response.helper';
import { CreateGoldPriceDto } from './dto/create-gold-price.dto';
import { GoldPriceService } from './gold-price.service';

type ChartFilter = '7d' | '30d' | '90d' | '1y';

@Controller('admin/gold-price')
@UseGuards(JwtAuthGuard, AdminRolesGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
@ApiTags('Gold Price')
@ApiBearerAuth()
export class GoldPriceAdminController {
  constructor(
    private readonly goldPriceService: GoldPriceService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @Get('current')
  async current() {
    const data = await this.goldPriceService.getCurrentPrice();
    return successResponse('Current gold price fetched', data);
  }

  @Get('chart')
  async chart(@Query('filter') filter?: ChartFilter) {
    const safeFilter: ChartFilter = filter ?? '7d';
    const prices = await this.goldPriceService.getPriceHistory(safeFilter);
    return successResponse('Gold price chart fetched', { prices, filter: safeFilter });
  }

  @Post()
  async addPrice(
    @Body() dto: CreateGoldPriceDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
  ) {
    const data = await this.goldPriceService.addPrice({
      mongolBankPrice: dto.mongolBankPrice,
      buyPrice: dto.buyPrice,
      sellPrice: dto.sellPrice,
      note: dto.note,
      adminId: user?.id,
      source: 'MANUAL',
    });
    await this.activityLogService.log({
      adminId: user?.id,
      action: 'UPDATE_GOLD_PRICE',
      entity: 'GoldPrice',
      entityId: data.id,
      ipAddress: req.ip,
      metadata: {
        mongolBankPrice: dto.mongolBankPrice,
        buyPrice: dto.buyPrice,
        sellPrice: dto.sellPrice,
        changePercent: data.changePercent?.toString() ?? null,
        note: dto.note ?? null,
      },
    });
    return successResponse('Gold price updated', data);
  }

  @Get('history')
  async history(@Query('page') page?: string, @Query('limit') limit?: string) {
    const data = await this.goldPriceService.getAdminHistory(
      Number(page ?? 1),
      Number(limit ?? 30),
    );
    return successResponse('Gold price history fetched', data);
  }
}
