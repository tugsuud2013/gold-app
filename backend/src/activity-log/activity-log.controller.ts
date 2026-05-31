import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../auth/guards/admin-roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { successResponse } from '../common/response.helper';
import { ActivityLogService } from './activity-log.service';

@Controller('admin/logs')
@UseGuards(JwtAuthGuard, AdminRolesGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN)
@ApiTags('Admin')
@ApiBearerAuth()
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  async getLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('adminId') adminId?: string,
  ) {
    const data = await this.activityLogService.getAdminLogs(
      Number(page ?? 1),
      Number(limit ?? 50),
      adminId,
    );
    return successResponse('Admin activity logs fetched', data);
  }
}
