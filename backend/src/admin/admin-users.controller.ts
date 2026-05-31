import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole, MembershipLevel, Prisma, UserStatus } from '@prisma/client';
import type { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../auth/guards/admin-roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { PrismaService } from '../prisma/prisma.service';
import { successResponse } from '../common/response.helper';
import { UpdateUserChatBanDto } from './dto/update-user-chat-ban.dto';
import { UpdateUserKycStatusDto } from './dto/update-user-kyc-status.dto';
import { UpdateUserMembershipDto } from './dto/update-user-membership.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminRolesGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN)
@ApiTags('Admin')
@ApiBearerAuth()
export class AdminUsersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  private readonly adminUserSelect = {
    id: true,
    phoneNumber: true,
    firstName: true,
    lastName: true,
    registerNumber: true,
    kycStatus: true,
    membershipLevel: true,
    status: true,
    isChatBanned: true,
    createdAt: true,
    updatedAt: true,
    wallet: true,
  } satisfies Prisma.UserSelect;

  private getAdminId(user: AuthenticatedUser | undefined): string {
    if (!user || user.kind !== 'admin') {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
    }
    return user.id;
  }

  @Get()
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: UserStatus,
    @Query('membershipLevel') membershipLevel?: MembershipLevel,
    @Query('kycStatus') kycStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED',
  ) {
    const safePage = Math.max(1, Number(page ?? 1));
    const safeLimit = Math.min(100, Math.max(1, Number(limit ?? 20)));
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.UserWhereInput = {
      status: status as UserStatus | undefined,
      membershipLevel: membershipLevel as MembershipLevel | undefined,
      kycStatus: kycStatus as Prisma.EnumKycStatusFilter | undefined,
      OR: search
        ? [
            { phoneNumber: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { registerNumber: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: this.adminUserSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return successResponse('Admin users fetched', {
      page: safePage,
      limit: safeLimit,
      total,
      items,
    });
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const data = await this.prisma.user.findUnique({
      where: { id },
      select: this.adminUserSelect,
    });
    return successResponse('Admin user details fetched', data);
  }

  @Put(':id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
  ) {
    const adminId = this.getAdminId(user);
    const data = await this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
    });
    await this.activityLogService.log({
      adminId,
      action: 'UPDATE_USER_STATUS',
      entity: 'User',
      entityId: id,
      ipAddress: req.ip,
      metadata: { status: dto.status },
    });
    return successResponse('User status updated', data);
  }

  @Put(':id/membership')
  async updateMembership(
    @Param('id') id: string,
    @Body() dto: UpdateUserMembershipDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
  ) {
    const adminId = this.getAdminId(user);
    const data = await this.prisma.user.update({
      where: { id },
      data: { membershipLevel: dto.membershipLevel },
    });
    await this.activityLogService.log({
      adminId,
      action: 'UPDATE_USER_MEMBERSHIP',
      entity: 'User',
      entityId: id,
      ipAddress: req.ip,
      metadata: { membershipLevel: dto.membershipLevel },
    });
    return successResponse('User membership updated', data);
  }

  @Put(':id/chat-ban')
  async updateChatBan(
    @Param('id') id: string,
    @Body() dto: UpdateUserChatBanDto,
  ) {
    const data = await this.prisma.user.update({
      where: { id },
      data: { isChatBanned: dto.isChatBanned },
    });
    return successResponse('User chat ban updated', data);
  }

  @Put(':id/kyc-status')
  async updateKycStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserKycStatusDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Req() req: Request,
  ) {
    const adminId = this.getAdminId(user);
    const data = await this.prisma.user.update({
      where: { id },
      data: { kycStatus: dto.status },
    });
    await this.activityLogService.log({
      adminId,
      action: 'UPDATE_USER_KYC_STATUS',
      entity: 'User',
      entityId: id,
      ipAddress: req.ip,
      metadata: { status: dto.status, note: dto.note ?? null },
    });
    return successResponse('User KYC status updated', data);
  }

  @Get(':id/wallet')
  async getUserWallet(@Param('id') id: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return successResponse('User wallet fetched', wallet);
  }
}
