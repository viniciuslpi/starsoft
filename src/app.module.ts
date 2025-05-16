import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { OrderModule } from './order/order.module';
import { ConfigurationModule as ConfigModule } from './config/config.module';
import { ElasticModule } from './elastic/elastic.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    ElasticModule,
    OrderModule,
    ElasticModule,
  ],
})
export class AppModule {}
