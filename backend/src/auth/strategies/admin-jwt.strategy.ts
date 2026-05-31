import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../types/authenticated-user.type';

interface AdminJwtPayload {
  sub: string;
  adminId: string;
  email: string;
  role: string;
}

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: AdminJwtPayload): Promise<AuthenticatedUser> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: payload.adminId ?? payload.sub },
    });

    if (!admin) {
      throw new UnauthorizedException({
        message: 'Admin not found',
        errorCode: 'ADMIN_NOT_FOUND',
      });
    }

    return { ...admin, kind: 'admin' };
  }
}
