import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { KycStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.type';

@Injectable()
export class KycVerifiedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user || user.kind !== 'user') {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
    }

    const dbUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.kycStatus !== KycStatus.VERIFIED) {
      throw new ForbiddenException({
        message: 'KYC баталгаажаагүй байна',
        errorCode: 'KYC_NOT_VERIFIED',
      });
    }

    return true;
  }
}
