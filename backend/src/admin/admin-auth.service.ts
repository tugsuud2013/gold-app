import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { AdminRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: AdminLoginDto) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!admin) {
      throw new UnauthorizedException({
        message: 'Invalid email or password',
        errorCode: 'INVALID_CREDENTIALS',
      });
    }

    const valid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedException({
        message: 'Invalid email or password',
        errorCode: 'INVALID_CREDENTIALS',
      });
    }

    if (admin.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException({
        message: 'Admin account is not active',
        errorCode: 'ADMIN_INACTIVE',
      });
    }

    const accessToken = await this.jwtService.signAsync(
      {
        sub: admin.id,
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') ?? '1h',
      } as JwtSignOptions,
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      role: admin.role,
    };
  }

  async createAdmin(dto: CreateAdminDto) {
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException({
        message: 'Admin email already exists',
        errorCode: 'ADMIN_EMAIL_EXISTS',
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        name: dto.name,
        role: dto.role ?? AdminRole.OPERATOR,
      },
    });
  }

  async changePassword(
    adminId: string,
    dto: { currentPassword: string; newPassword: string },
  ) {
    const admin = await this.prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!admin) {
      throw new UnauthorizedException({
        message: 'Admin not found',
        errorCode: 'ADMIN_NOT_FOUND',
      });
    }
    const valid = await bcrypt.compare(dto.currentPassword, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedException({
        message: 'Current password is incorrect',
        errorCode: 'INVALID_CURRENT_PASSWORD',
      });
    }
    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.adminUser.update({
      where: { id: adminId },
      data: { passwordHash },
    });
    return { changed: true };
  }
}
