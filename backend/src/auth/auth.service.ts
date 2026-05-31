import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

const BCRYPT_ROUNDS = 12;
const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_LOGIN_FAILURES = 5;
const LOGIN_BLOCK_MS = 15 * 60 * 1000;

interface OtpEntry {
  code: string;
  expiresAt: number;
}

interface LoginAttemptState {
  count: number;
  blockedUntil?: number;
}

@Injectable()
export class AuthService {
  private readonly otpStore = new Map<string, OtpEntry>();
  private readonly loginAttempts = new Map<string, LoginAttemptState>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly walletService: WalletService,
  ) {}

  private normalizePhone(phone: string): string {
    return phone.trim();
  }

  private assertNotLoginBlocked(phone: string): void {
    const rec = this.loginAttempts.get(phone);
    if (!rec?.blockedUntil) {
      return;
    }
    if (rec.blockedUntil > Date.now()) {
      throw new HttpException(
        {
          message:
            'Too many failed login attempts. Please try again in 15 minutes.',
          errorCode: 'LOGIN_BLOCKED',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    this.loginAttempts.delete(phone);
  }

  private recordLoginFailure(phone: string): void {
    const rec = this.loginAttempts.get(phone) ?? { count: 0 };
    rec.count += 1;
    if (rec.count >= MAX_LOGIN_FAILURES) {
      rec.blockedUntil = Date.now() + LOGIN_BLOCK_MS;
      rec.count = 0;
    }
    this.loginAttempts.set(phone, rec);
  }

  private clearLoginFailures(phone: string): void {
    this.loginAttempts.delete(phone);
  }

  async register(dto: RegisterDto) {
    const phoneNumber = this.normalizePhone(dto.phoneNumber);

    const existing = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });
    if (existing) {
      throw new ConflictException({
        message: 'Phone number already registered',
        errorCode: 'PHONE_ALREADY_REGISTERED',
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        phoneNumber,
        passwordHash,
      },
    });
    await this.walletService.createWalletForUser(user.id);

    const tokens = await this.issueTokens(user);
    return tokens;
  }

  async login(dto: LoginDto) {
    const phoneNumber = this.normalizePhone(dto.phoneNumber);
    this.assertNotLoginBlocked(phoneNumber);

    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      this.recordLoginFailure(phoneNumber);
      throw new UnauthorizedException({
        message: 'Invalid phone number or password',
        errorCode: 'INVALID_CREDENTIALS',
      });
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      this.recordLoginFailure(phoneNumber);
      throw new UnauthorizedException({
        message: 'Invalid phone number or password',
        errorCode: 'INVALID_CREDENTIALS',
      });
    }

    this.clearLoginFailures(phoneNumber);

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException({
        message: 'Account is suspended',
        errorCode: 'ACCOUNT_SUSPENDED',
      });
    }
    if (user.status === UserStatus.DELETED) {
      throw new UnauthorizedException({
        message: 'Account is not available',
        errorCode: 'ACCOUNT_DELETED',
      });
    }

    return this.issueTokens(user);
  }

  async sendOtp(phoneNumber: string) {
    const phone = this.normalizePhone(phoneNumber);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.otpStore.set(phone, {
      code,
      expiresAt: Date.now() + OTP_TTL_MS,
    });
    return {
      expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const phone = this.normalizePhone(dto.phoneNumber);
    const entry = this.otpStore.get(phone);

    if (!entry || Date.now() > entry.expiresAt) {
      this.otpStore.delete(phone);
      throw new BadRequestException({
        message: 'OTP expired or not found. Request a new code.',
        errorCode: 'OTP_INVALID',
      });
    }

    if (entry.code !== dto.otp) {
      throw new BadRequestException({
        message: 'Invalid OTP',
        errorCode: 'OTP_MISMATCH',
      });
    }

    this.otpStore.delete(phone);
    return { verified: true };
  }

  async refreshToken(dto: RefreshTokenDto) {
    interface RefreshPayload {
      sub: string;
      jti: string;
    }

    let payload: RefreshPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshPayload>(
        dto.refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException({
        message: 'Invalid or expired refresh token',
        errorCode: 'INVALID_REFRESH_TOKEN',
      });
    }

    const row = await this.prisma.refreshToken.findFirst({
      where: { id: payload.jti, userId: payload.sub },
    });

    if (!row || row.expiresAt < new Date()) {
      if (row) {
        await this.prisma.refreshToken.delete({ where: { id: row.id } });
      }
      throw new UnauthorizedException({
        message: 'Refresh token revoked or expired',
        errorCode: 'REFRESH_TOKEN_INVALID',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException({
        message: 'Account not active',
        errorCode: 'ACCOUNT_INACTIVE',
      });
    }

    const accessToken = await this.signAccessToken(user);

    return { accessToken };
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return { loggedOut: true };
  }

  private async issueTokens(user: User) {
    const accessToken = await this.signAccessToken(user);

    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '30d';
    const expiresAt = this.computeExpiryDate(refreshExpiresIn);

    const refreshRecord = await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        expiresAt,
      },
    });

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, jti: refreshRecord.id },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiresIn,
      } as JwtSignOptions,
    );

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer' as const,
    };
  }

  private async signAccessToken(user: User): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        phoneNumber: user.phoneNumber,
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') ?? '1h',
      } as JwtSignOptions,
    );
  }

  /**
   * Parses common JWT expiry strings (e.g. 30d, 1h) into an absolute time.
   */
  private computeExpiryDate(duration: string): Date {
    const match = /^(\d+)([smhd])$/i.exec(duration.trim());
    if (!match) {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    const amount = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    let ms = amount * 1000;
    if (unit === 'm') ms = amount * 60 * 1000;
    if (unit === 'h') ms = amount * 60 * 60 * 1000;
    if (unit === 'd') ms = amount * 24 * 60 * 60 * 1000;
    return new Date(Date.now() + ms);
  }
}
