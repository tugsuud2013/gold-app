import { Module } from '@nestjs/common';
import { GoldPriceModule } from '../gold-price/gold-price.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [PrismaModule, GoldPriceModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
