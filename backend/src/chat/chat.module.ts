import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatAdminController } from './chat-admin.controller';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [ChatController, ChatAdminController],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {}
