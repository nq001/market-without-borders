import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  DomainException,
  IDomainException,
} from '../domain/domain-exception.base';

interface HttpExceptionResponseBody {
  message?: string | string[];
  error?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const rawRes = exception.getResponse();
      const res: HttpExceptionResponseBody =
        typeof rawRes === 'object' && rawRes !== null
          ? (rawRes as HttpExceptionResponseBody)
          : { message: String(rawRes) };

      const messageVal = res.message || exception.message;
      if (Array.isArray(messageVal)) {
        details = messageVal;
        message = messageVal[0];
      } else {
        message = messageVal;
      }

      if ('code' in exception && typeof (exception as IDomainException).code === 'string') {
        code = (exception as IDomainException).code;
      } else {
        code =
          typeof res.error === 'string'
            ? res.error.toUpperCase().replace(/\s+/g, '_')
            : 'HTTP_ERROR';
      }
    } else if (exception instanceof DomainException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      code = exception.code;
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled Exception: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error(
        `Unhandled non-Error exception: ${JSON.stringify(exception)}`,
      );
    }

    response.status(status).json({
      statusCode: status,
      code,
      message,
      ...(details ? { details } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
