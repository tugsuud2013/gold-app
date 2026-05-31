import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatSenderType, ChatThreadStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const userSelect = {
  id: true,
  phoneNumber: true,
  firstName: true,
  lastName: true,
  kycStatus: true,
  membershipLevel: true,
  isChatBanned: true,
  status: true,
} as const;

export type ChatThreadFilters = {
  status?: ChatThreadStatus;
  unreadOnly?: boolean;
  search?: string;
};

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async touchThreadOnUserMessage(userId: string, message: string, createdAt: Date) {
    const preview = message.length > 120 ? `${message.slice(0, 117)}...` : message;
    await this.prisma.chatThread.upsert({
      where: { userId },
      create: {
        userId,
        status: ChatThreadStatus.OPEN,
        lastMessageAt: createdAt,
        lastMessageText: preview,
        unreadByAdmin: 1,
      },
      update: {
        status: ChatThreadStatus.OPEN,
        lastMessageAt: createdAt,
        lastMessageText: preview,
        unreadByAdmin: { increment: 1 },
      },
    });
  }

  async listThreads(filters: ChatThreadFilters) {
    const where: Prisma.ChatThreadWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.unreadOnly) {
      where.unreadByAdmin = { gt: 0 };
    }
    if (filters.search?.trim()) {
      const q = filters.search.trim();
      where.user = {
        OR: [
          { phoneNumber: { contains: q } },
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
        ],
      };
    }

    const items = await this.prisma.chatThread.findMany({
      where,
      include: { user: { select: userSelect } },
      orderBy: { lastMessageAt: 'desc' },
    });

    return items.map((thread) => this.serializeThread(thread));
  }

  async getThreadByUserId(userId: string) {
    const thread = await this.prisma.chatThread.findUnique({
      where: { userId },
      include: { user: { select: userSelect } },
    });
    if (!thread) {
      throw new NotFoundException({
        message: 'Chat thread not found',
        errorCode: 'CHAT_THREAD_NOT_FOUND',
      });
    }
    return this.serializeThread(thread);
  }

  async getThreadMessages(userId: string, page = 1, limit = 100) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(200, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.chatMessage.count({ where: { userId } }),
    ]);

    return {
      page: safePage,
      limit: safeLimit,
      total,
      items: items.map((row) => ({
        id: row.id,
        userId: row.userId,
        message: row.message,
        senderType: row.senderType,
        adminId: row.adminId,
        createdAt: row.createdAt,
      })),
    };
  }

  async sendAdminMessage(userId: string, message: string, adminId?: string) {
    const trimmed = message.trim();
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    const row = await this.prisma.chatMessage.create({
      data: {
        userId,
        message: trimmed,
        senderType: ChatSenderType.ADMIN,
        adminId: adminId ?? null,
      },
    });

    const preview = trimmed.length > 120 ? `${trimmed.slice(0, 117)}...` : trimmed;
    await this.prisma.chatThread.upsert({
      where: { userId },
      create: {
        userId,
        status: ChatThreadStatus.OPEN,
        lastMessageAt: row.createdAt,
        lastMessageText: preview,
        unreadByAdmin: 0,
        adminLastReadAt: new Date(),
      },
      update: {
        status: ChatThreadStatus.OPEN,
        lastMessageAt: row.createdAt,
        lastMessageText: preview,
        adminLastReadAt: new Date(),
        unreadByAdmin: 0,
      },
    });

    return {
      id: row.id,
      userId: row.userId,
      message: row.message,
      senderType: row.senderType,
      adminId: row.adminId,
      createdAt: row.createdAt,
    };
  }

  async markThreadRead(userId: string) {
    const thread = await this.prisma.chatThread.update({
      where: { userId },
      data: {
        adminLastReadAt: new Date(),
        unreadByAdmin: 0,
      },
      include: { user: { select: userSelect } },
    });
    return this.serializeThread(thread);
  }

  async setThreadStatus(userId: string, status: ChatThreadStatus) {
    const thread = await this.prisma.chatThread.upsert({
      where: { userId },
      create: {
        userId,
        status,
        lastMessageAt: new Date(),
        unreadByAdmin: 0,
      },
      update: { status },
      include: { user: { select: userSelect } },
    });
    return this.serializeThread(thread);
  }

  async setChatBan(userId: string, isChatBanned: boolean) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isChatBanned },
      select: userSelect,
    });
    return user;
  }

  private serializeThread(
    thread: Prisma.ChatThreadGetPayload<{ include: { user: { select: typeof userSelect } } }>,
  ) {
    const user = thread.user;
    const name = `${user.lastName ?? ''} ${user.firstName ?? ''}`.trim() || user.phoneNumber;
    return {
      id: thread.id,
      userId: thread.userId,
      status: thread.status,
      adminLastReadAt: thread.adminLastReadAt,
      lastMessageAt: thread.lastMessageAt,
      lastMessageText: thread.lastMessageText,
      unreadByAdmin: thread.unreadByAdmin,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      user: {
        ...user,
        name,
      },
    };
  }
}
