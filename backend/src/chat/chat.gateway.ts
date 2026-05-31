import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatSenderType } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from './chat.service';

interface JwtPayload {
  sub: string;
}

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly connectedClients = new Map<string, string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const rawToken =
        (client.handshake.auth?.token as string | undefined) ??
        (client.handshake.query?.token as string | undefined) ??
        '';
      const token = rawToken.replace(/^Bearer\s+/i, '');
      const payload = jwt.verify(
        token,
        this.configService.getOrThrow<string>('JWT_SECRET'),
      ) as JwtPayload;

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { wallet: true },
      });
      if (!user || user.isChatBanned) {
        client.disconnect(true);
        return;
      }
      if (!user.wallet || user.wallet.balanceGrams.lte(0)) {
        client.disconnect(true);
        return;
      }

      this.connectedClients.set(client.id, user.id);
    } catch (error) {
      this.logger.warn(`Socket connection rejected: ${String(error)}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { message?: string },
  ) {
    const userId = this.connectedClients.get(client.id);
    if (!userId) {
      throw new BadRequestException('Unauthorized socket');
    }

    const message = body.message?.trim() ?? '';
    if (!message || message.length > 500) {
      throw new BadRequestException('Message must be between 1 and 500 chars');
    }

    const row = await this.prisma.chatMessage.create({
      data: { userId, message, senderType: ChatSenderType.USER },
      include: { user: true },
    });

    await this.chatService.touchThreadOnUserMessage(userId, message, row.createdAt);

    const payload = {
      id: row.id,
      userId: row.userId,
      userName: `${row.user.firstName ?? ''} ${row.user.lastName ?? ''}`.trim(),
      message: row.message,
      createdAt: row.createdAt,
    };

    this.server.emit('newMessage', payload);
    return payload;
  }

  @SubscribeMessage('getHistory')
  async getHistory() {
    const rows = await this.prisma.chatMessage.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      userName: `${row.user.firstName ?? ''} ${row.user.lastName ?? ''}`.trim(),
      message: row.message,
      createdAt: row.createdAt,
    }));
  }
}
