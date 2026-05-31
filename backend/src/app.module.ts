import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppThrottlerGuard } from './common/guards/app-throttler.guard';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ContractModule } from './contract/contract.module';
import { GoldPriceModule } from './gold-price/gold-price.module';
import { HealthModule } from './health/health.module';
import { MembershipModule } from './membership/membership.module';
import { MembershipService } from './membership/membership.service';
import { NewsModule } from './news/news.module';
import { PrismaModule } from './prisma/prisma.module';
import { PurchaseModule } from './purchase/purchase.module';
import { QpayModule } from './qpay/qpay.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { SellRequestModule } from './sell-request/sell-request.module';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: 60_000,
            limit:
              config.get<string>('NODE_ENV') === 'production' ? 10 : 300,
          },
        ],
      }),
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    AdminModule,
    UserModule,
    WalletModule,
    PurchaseModule,
    SellRequestModule,
    GoldPriceModule,
    NewsModule,
    ChatModule,
    MembershipModule,
    ReportsModule,
    SettingsModule,
    ActivityLogModule,
    ContractModule,
    QpayModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
  ],
})
export class AppModule implements OnModuleInit, NestModule {
  private readonly logger = new Logger(AppModule.name);

  constructor(private readonly membershipService: MembershipService) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.membershipService.seedDefaultConfig();
    } catch (error) {
      this.logger.error(
        'Membership seed failed during startup.',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*path');
  }
}
