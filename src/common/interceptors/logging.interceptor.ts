import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    const { method, url, ip } = req;

    return next.handle().pipe(
      tap(() => {
        const log = {
          type: 'access',
          timestamp: new Date().toISOString(),
          method,
          url,
          ip,
          durationMs: Date.now() - now,
        };
        console.log(JSON.stringify(log));
      }),
    );
  }
}
