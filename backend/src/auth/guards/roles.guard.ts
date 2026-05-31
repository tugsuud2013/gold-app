import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { AuthenticatedUser } from '../types/authenticated-user.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<AdminRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user || user.kind !== 'admin') {
      throw new ForbiddenException({
        message: 'Admin access required',
        errorCode: 'FORBIDDEN_ROLE',
      });
    }

    if (!roles.includes(user.role)) {
      throw new ForbiddenException({
        message: 'Insufficient permissions',
        errorCode: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    return true;
  }
}
