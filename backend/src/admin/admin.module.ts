import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminManageController } from './admin-manage.controller';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminPurchasesController } from './admin-purchases.controller';
import { AdminUsersController } from './admin-users.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ActivityLogModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ??
            '1h') as SignOptions['expiresIn'],
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AdminAuthController,
    AdminUsersController,
    AdminPurchasesController,
    AdminManageController,
  ],
  providers: [AdminAuthService],
  exports: [AdminAuthService],
})
export class AdminModule {}
