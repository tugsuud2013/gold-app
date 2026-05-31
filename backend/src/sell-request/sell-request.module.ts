import { Module } from '@nestjs/common';
import { MembershipModule } from '../membership/membership.module';
import { PrismaModule } from '../prisma/prisma.module';
import { WalletModule } from '../wallet/wallet.module';
import { SellRequestController } from './sell-request.controller';
import { SellRequestService } from './sell-request.service';

@Module({
  imports: [PrismaModule, WalletModule, MembershipModule],
  controllers: [SellRequestController],
  providers: [SellRequestService],
  exports: [SellRequestService],
})
export class SellRequestModule {}
