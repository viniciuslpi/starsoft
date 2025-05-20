import { Injectable } from '@nestjs/common';

@Injectable()
export class AppLogger {
  logBusiness(event: string, data: Record<string, any>) {
    const log = {
      type: 'business',
      timestamp: new Date().toISOString(),
      event,
      data,
    };
    console.log(JSON.stringify(log));
  }
}
