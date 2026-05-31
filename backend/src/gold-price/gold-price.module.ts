import { Module } from '@nestjs/common';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { PrismaModule } from '../prisma/prisma.module';
import { GoldPriceAdminController } from './gold-price-admin.controller';
import { GoldPriceController } from './gold-price.controller';
import { GoldPriceService } from './gold-price.service';

@Module({
  imports: [PrismaModule, ActivityLogModule],
  controllers: [GoldPriceController, GoldPriceAdminController],
  providers: [GoldPriceService],
  exports: [GoldPriceService],
})
export class GoldPriceModule {}
