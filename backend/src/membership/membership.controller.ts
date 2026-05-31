import {
  Body,
  Controller,
  Get,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole, MembershipLevel, Prisma } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../auth/guards/admin-roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { successResponse } from '../common/response.helper';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMembershipConfigDto } from './dto/update-membership-config.dto';
import { MembershipService } from './membership.service';

@Controller()
@ApiTags('User')
export class MembershipController {
  constructor(
    private readonly membershipService: MembershipService,
    private readonly prisma: PrismaService,
  ) {}

  private getUserId(user: AuthenticatedUser | undefined): string {
    if (!user || user.kind !== 'user') {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
    }
    return user.id;
  }

  @Get('membership/info')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMembershipInfo(@CurrentUser() user: AuthenticatedUser | undefined) {
    const userId = this.getUserId(user);
    const [dbUser, wallet, configs] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.wallet.findUnique({ where: { userId } }),
      this.membershipService.getMembershipConfig(),
    ]);

    const currentLevel = dbUser?.membershipLevel ?? MembershipLevel.NORMAL;
    const purchased = wallet?.totalPurchasedGrams ?? new Prisma.Decimal(0);

    let gramsToNextLevel = 0;
    for (const config of configs) {
      if (config.minGrams.gt(purchased)) {
        gramsToNextLevel = config.minGrams.minus(purchased).toNumber();
        break;
      }
    }

    return successResponse('Membership info fetched', {
      currentLevel,
      levels: configs,
      gramsToNextLevel,
    });
  }

  @Get('admin/membership/config')
  @UseGuards(JwtAuthGuard, AdminRolesGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async getMembershipConfig() {
    const data = await this.membershipService.getMembershipConfig();
    return successResponse('Membership config fetched', data);
  }

  @Put('admin/membership/config')
  @UseGuards(JwtAuthGuard, AdminRolesGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async updateMembershipConfig(@Body() dto: UpdateMembershipConfigDto) {
    const data = await this.membershipService.updateMembershipConfig(dto.configs);
    return successResponse('Membership config updated', data);
  }
}
