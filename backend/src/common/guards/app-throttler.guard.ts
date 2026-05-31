import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    if (process.env.NODE_ENV !== 'production') {
      const request = context.switchToHttp().getRequest<Request>();
      const path = request.path ?? request.url?.split('?')[0] ?? '';

      if (request.method === 'POST' && path.endsWith('/admin/auth/login')) {
        return true;
      }
    }

    return super.shouldSkip(context);
  }
}
