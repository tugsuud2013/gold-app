import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole, SellRequestStatus } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../auth/guards/admin-roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { KycVerifiedGuard } from '../common/guards/kyc-verified.guard';
import { successResponse } from '../common/response.helper';
import { CancelSellRequestDto } from './dto/cancel-sell-request.dto';
import { CreateSellRequestDto } from './dto/create-sell-request.dto';
import { SellRequestService } from './sell-request.service';

@Controller()
@ApiTags('Sell Request')
export class SellRequestController {
  constructor(private readonly sellRequestService: SellRequestService) {}

  private getUser(user: AuthenticatedUser | undefined): AuthenticatedUser {
    if (!user) {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
    }
    return user;
  }

  @Post('sell-request')
  @UseGuards(JwtAuthGuard, KycVerifiedGuard)
  @ApiBearerAuth()
  async createSellRequest(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: CreateSellRequestDto,
  ) {
    const actor = this.getUser(user);
    if (actor.kind !== 'user') {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
    }
    const data = await this.sellRequestService.createSellRequest(actor.id, dto);
    return successResponse('Sell request created', data);
  }

  @Get('sell-request/history')
  @UseGuards(JwtAuthGuard, KycVerifiedGuard)
  @ApiBearerAuth()
  async getHistory(@CurrentUser() user: AuthenticatedUser | undefined) {
    const actor = this.getUser(user);
    if (actor.kind !== 'user') {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
    }
    const data = await this.sellRequestService.getSellRequestHistory(actor.id);
    return successResponse('Sell request history fetched', data);
  }

  @Get('admin/sell-requests/stats')
  @UseGuards(JwtAuthGuard, AdminRolesGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async getSellRequestStats(@Query('userId') userId?: string) {
    const data = await this.sellRequestService.getSellRequestStats(userId);
    return successResponse('Sell request stats fetched', data);
  }

  @Get('admin/sell-requests')
  @UseGuards(JwtAuthGuard, AdminRolesGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async getSellRequests(
    @Query('status') status?: SellRequestStatus,
    @Query('userId') userId?: string,
  ) {
    const data = await this.sellRequestService.getSellRequests(status, userId);
    return successResponse('Sell requests fetched', data);
  }

  @Get('admin/sell-requests/:id')
  @UseGuards(JwtAuthGuard, AdminRolesGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async getSellRequestById(@Param('id') id: string) {
    const data = await this.sellRequestService.getSellRequestById(id);
    return successResponse('Sell request fetched', data);
  }

  @Put('admin/sell-requests/:id/approve')
  @UseGuards(JwtAuthGuard, AdminRolesGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async approveSellRequest(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') id: string,
  ) {
    const actor = this.getUser(user);
    const adminId = actor.id;
    const data = await this.sellRequestService.approveSellRequest(id, adminId);
    return successResponse('Sell request approved', data);
  }

  @Put('admin/sell-requests/:id/complete')
  @UseGuards(JwtAuthGuard, AdminRolesGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async completeSellRequest(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') id: string,
  ) {
    const actor = this.getUser(user);
    const adminId = actor.id;
    const data = await this.sellRequestService.completeSellRequest(id, adminId);
    return successResponse('Sell request completed', data);
  }

  @Put('admin/sell-requests/:id/cancel')
  @UseGuards(JwtAuthGuard, AdminRolesGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async cancelSellRequest(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') id: string,
    @Body() dto: CancelSellRequestDto,
  ) {
    const actor = this.getUser(user);
    const adminId = actor.id;
    const data = await this.sellRequestService.cancelSellRequest(
      id,
      adminId,
      dto.note,
    );
    return successResponse('Sell request cancelled', data);
  }
}
