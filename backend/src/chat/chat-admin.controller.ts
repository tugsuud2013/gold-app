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
import { AdminRole, ChatThreadStatus } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../auth/guards/admin-roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { successResponse } from '../common/response.helper';
import { ChatService } from './chat.service';
import { SendAdminChatMessageDto } from './dto/send-admin-chat-message.dto';

@Controller('admin/chat')
@UseGuards(JwtAuthGuard, AdminRolesGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
@ApiTags('Admin Chat')
@ApiBearerAuth()
export class ChatAdminController {
  constructor(private readonly chatService: ChatService) {}

  private getAdminId(user: AuthenticatedUser | undefined): string | undefined {
    if (!user?.id) {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
    }
    return user.id;
  }

  @Get('threads')
  async listThreads(
    @Query('status') status?: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('search') search?: string,
  ) {
    const parsedStatus =
      status === ChatThreadStatus.OPEN || status === ChatThreadStatus.CLOSED
        ? status
        : undefined;
    const data = await this.chatService.listThreads({
      status: parsedStatus,
      unreadOnly: unreadOnly === 'true' || unreadOnly === '1',
      search,
    });
    return successResponse('Chat threads fetched', data);
  }

  @Get('threads/:userId')
  async getThread(@Param('userId') userId: string) {
    const data = await this.chatService.getThreadByUserId(userId);
    return successResponse('Chat thread fetched', data);
  }

  @Get('threads/:userId/messages')
  async getMessages(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.chatService.getThreadMessages(
      userId,
      Number(page ?? 1),
      Number(limit ?? 100),
    );
    return successResponse('Chat messages fetched', data);
  }

  @Post('threads/:userId/messages')
  async sendMessage(
    @Param('userId') userId: string,
    @Body() dto: SendAdminChatMessageDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ) {
    const data = await this.chatService.sendAdminMessage(userId, dto.message, this.getAdminId(user));
    return successResponse('Chat message sent', data);
  }

  @Put('threads/:userId/read')
  async markRead(@Param('userId') userId: string) {
    const data = await this.chatService.markThreadRead(userId);
    return successResponse('Chat thread marked as read', data);
  }

  @Put('threads/:userId/close')
  async closeThread(@Param('userId') userId: string) {
    const data = await this.chatService.setThreadStatus(userId, ChatThreadStatus.CLOSED);
    return successResponse('Chat thread closed', data);
  }

  @Put('threads/:userId/open')
  async openThread(@Param('userId') userId: string) {
    const data = await this.chatService.setThreadStatus(userId, ChatThreadStatus.OPEN);
    return successResponse('Chat thread opened', data);
  }

  @Put('threads/:userId/ban')
  async banUser(@Param('userId') userId: string) {
    const data = await this.chatService.setChatBan(userId, true);
    return successResponse('User chat banned', data);
  }

  @Put('threads/:userId/unban')
  async unbanUser(@Param('userId') userId: string) {
    const data = await this.chatService.setChatBan(userId, false);
    return successResponse('User chat unbanned', data);
  }
}
