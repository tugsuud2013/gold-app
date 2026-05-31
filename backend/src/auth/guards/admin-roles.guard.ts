import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../types/authenticated-user.type';

@Injectable()
export class AdminRolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
    }

    if (user.kind !== 'admin' || !user.id) {
      throw new ForbiddenException({
        message: 'Admin token required',
        errorCode: 'ADMIN_TOKEN_REQUIRED',
      });
    }

    return true;
  }
}
