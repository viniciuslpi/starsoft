import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const status = exception.getStatus();
    const message = exception.message;

    const log = {
      type: 'error',
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      status,
      message,
      stack: exception.stack,
    };

    console.error(JSON.stringify(log));
    response.status(status).json({ status, message });
  }
}
