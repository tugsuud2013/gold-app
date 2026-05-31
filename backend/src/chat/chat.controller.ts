import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../auth/guards/admin-roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { successResponse } from '../common/response.helper';

@Controller()
@ApiTags('Chat')
export class ChatController {
  constructor(private readonly prisma: PrismaService) {}

  private assertUser(user: AuthenticatedUser | undefined): void {
    if (!user) {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
    }
  }

  @Get('chat/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMessages(@Query('page') page?: string, @Query('limit') limit?: string) {
    const safePage = Math.max(1, Number(page ?? 1));
    const safeLimit = Math.min(100, Math.max(1, Number(limit ?? 50)));
    const skip = (safePage - 1) * safeLimit;
    const [items, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.chatMessage.count(),
    ]);
    return successResponse('Chat messages fetched', {
      page: safePage,
      limit: safeLimit,
      total,
      items,
    });
  }

  @Get('admin/chat/messages')
  @UseGuards(JwtAuthGuard, AdminRolesGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async getAdminMessages(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    this.assertUser(user);
    return this.getMessages(page, limit);
  }

  @Delete('admin/chat/messages/:id')
  @UseGuards(JwtAuthGuard, AdminRolesGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiBearerAuth()
  async deleteMessage(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') id: string,
  ) {
    this.assertUser(user);
    const data = await this.prisma.chatMessage.delete({ where: { id } });
    return successResponse('Chat message deleted', data);
  }
}
