import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { OrderModule } from './order/order.module';
import { ConfigurationModule as ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule, DatabaseModule, OrderModule],
})
export class AppModule {}
