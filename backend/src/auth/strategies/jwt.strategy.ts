import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../types/authenticated-user.type';

interface AccessJwtPayload {
  sub: string;
  phoneNumber?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
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

  async validate(payload: AccessJwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (user) {
      return { ...user, kind: 'user' };
    }

    const admin = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
    });
    if (admin) {
      return { ...admin, kind: 'admin' };
    }

    throw new UnauthorizedException({
      message: 'User not found',
      errorCode: 'USER_NOT_FOUND',
    });
  }
}
