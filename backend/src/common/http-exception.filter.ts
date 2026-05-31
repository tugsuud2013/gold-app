import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from './response.helper';

function statusToErrorCode(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'BAD_REQUEST';
    case HttpStatus.UNAUTHORIZED:
      return 'UNAUTHORIZED';
    case HttpStatus.FORBIDDEN:
      return 'FORBIDDEN';
    case HttpStatus.NOT_FOUND:
      return 'NOT_FOUND';
    case HttpStatus.CONFLICT:
      return 'CONFLICT';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'TOO_MANY_REQUESTS';
    default:
      return 'HTTP_ERROR';
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = exception.message;
    let errorCode = statusToErrorCode(status);

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const body = exceptionResponse as Record<string, unknown>;
      if (typeof body.message === 'string') {
        message = body.message;
      } else if (Array.isArray(body.message)) {
        message = body.message.join('; ');
      }
      if (typeof body.errorCode === 'string') {
        errorCode = body.errorCode;
      }
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    }

    const payload: ApiResponse<null> = {
      success: false,
      message,
      data: null,
      errorCode,
    };

    response.status(status).json(payload);
  }
}
