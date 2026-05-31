import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as
      | string
      | { message?: string | string[]; errorCode?: string };

    const message = Array.isArray((exceptionResponse as any)?.message)
      ? ((exceptionResponse as any).message as string[]).join('; ')
      : typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any)?.message ?? exception.message;

    const errorCode =
      typeof exceptionResponse === 'object' &&
      exceptionResponse &&
      'errorCode' in exceptionResponse &&
      typeof exceptionResponse.errorCode === 'string'
        ? exceptionResponse.errorCode
        : status === HttpStatus.UNAUTHORIZED
          ? 'UNAUTHORIZED'
          : status === HttpStatus.FORBIDDEN
            ? 'FORBIDDEN'
            : status === HttpStatus.NOT_FOUND
              ? 'NOT_FOUND'
              : status === HttpStatus.BAD_REQUEST
                ? 'BAD_REQUEST'
                : 'HTTP_ERROR';

    response.status(status).json({
      success: false,
      message,
      errorCode,
      data: null,
      statusCode: status,
    });
  }
}
