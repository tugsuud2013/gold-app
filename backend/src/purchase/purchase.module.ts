import { Module } from '@nestjs/common';
import { ContractModule } from '../contract/contract.module';
import { GoldPriceModule } from '../gold-price/gold-price.module';
import { MembershipModule } from '../membership/membership.module';
import { PrismaModule } from '../prisma/prisma.module';
import { QpayModule } from '../qpay/qpay.module';
import { WalletModule } from '../wallet/wallet.module';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './purchase.service';

@Module({
  imports: [
    PrismaModule,
    GoldPriceModule,
    ContractModule,
    QpayModule,
    WalletModule,
    MembershipModule,
  ],
  controllers: [PurchaseController],
  providers: [PurchaseService],
  exports: [PurchaseService],
})
export class PurchaseModule {}
