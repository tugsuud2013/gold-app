import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QpayService } from './qpay.service';

@Module({
  imports: [ConfigModule],
  providers: [QpayService],
  exports: [QpayService],
})
export class QpayModule {}
