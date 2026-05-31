import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../auth/guards/admin-roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { successResponse } from '../common/response.helper';
import { parseMembershipLevel, type ReportFilters } from './report-filters.type';
import { ReportsService } from './reports.service';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, AdminRolesGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
@ApiTags('Admin')
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  private parseFilters(
    startDate?: string,
    endDate?: string,
    membershipLevel?: string,
    status?: string,
    userId?: string,
    userSearch?: string,
  ): ReportFilters {
    return {
      startDate,
      endDate,
      membershipLevel: parseMembershipLevel(membershipLevel),
      status,
      userId,
      userSearch,
    };
  }

  @Get('dashboard')
  async dashboard() {
    const data = await this.reportsService.getDashboardStats();
    return successResponse('Dashboard stats fetched', data);
  }

  @Get('summary')
  async summaryReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('membershipLevel') membershipLevel?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('userSearch') userSearch?: string,
  ) {
    const data = await this.reportsService.getSummaryReport(
      this.parseFilters(startDate, endDate, membershipLevel, status, userId, userSearch),
    );
    return successResponse('Summary report fetched', data);
  }

  @Get('purchases')
  async purchaseReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('membershipLevel') membershipLevel?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('userSearch') userSearch?: string,
  ) {
    const data = await this.reportsService.getPurchaseReport(
      this.parseFilters(startDate, endDate, membershipLevel, status, userId, userSearch),
    );
    return successResponse('Purchase report fetched', data);
  }

  @Get('sells')
  async sellReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('membershipLevel') membershipLevel?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('userSearch') userSearch?: string,
  ) {
    const data = await this.reportsService.getSellReport(
      this.parseFilters(startDate, endDate, membershipLevel, status, userId, userSearch),
    );
    return successResponse('Sell report fetched', data);
  }

  @Get('revenue')
  async revenueReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('membershipLevel') membershipLevel?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('userSearch') userSearch?: string,
  ) {
    const data = await this.reportsService.getRevenueReport(
      this.parseFilters(startDate, endDate, membershipLevel, status, userId, userSearch),
    );
    return successResponse('Revenue report fetched', data);
  }

  @Get('users')
  async userReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('membershipLevel') membershipLevel?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('userSearch') userSearch?: string,
  ) {
    const data = await this.reportsService.getUserReport(
      this.parseFilters(startDate, endDate, membershipLevel, status, userId, userSearch),
    );
    return successResponse('User report fetched', data);
  }

  @Get('gold-movement')
  async goldMovement(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('membershipLevel') membershipLevel?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('userSearch') userSearch?: string,
  ) {
    const data = await this.reportsService.getGoldMovementReport(
      this.parseFilters(startDate, endDate, membershipLevel, status, userId, userSearch),
    );
    return successResponse('Gold movement report fetched', data);
  }
}
