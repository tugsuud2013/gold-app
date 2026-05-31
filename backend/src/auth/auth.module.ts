import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { WalletModule } from '../wallet/wallet.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';
import { AdminRolesGuard } from './guards/admin-roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    WalletModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    AdminJwtStrategy,
    JwtAuthGuard,
    AdminJwtAuthGuard,
    AdminRolesGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    AdminJwtAuthGuard,
    AdminRolesGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
