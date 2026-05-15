/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';

@Catch(Error)
export class CustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const request = host.switchToHttp().getRequest();

    const isHttp = exception instanceof HttpException;
    const statusCode = isHttp ? exception.getStatus() : 400;
    const message = exception?.response?.message ?? exception?.message ?? 'Internal error';

    if (!isHttp) {
      this.logger.error(`${request.method} ${request.url} → ${exception?.stack ?? exception}`);
    }

    response.status(statusCode).json({ statusCode, message });
  }
}
