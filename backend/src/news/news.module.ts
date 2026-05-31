import { Module } from '@nestjs/common';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { PrismaModule } from '../prisma/prisma.module';
import { NewsAdminController } from './news-admin.controller';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

@Module({
  imports: [PrismaModule, ActivityLogModule],
  controllers: [NewsController, NewsAdminController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
