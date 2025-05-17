import { Module } from '@nestjs/common';

import { ConfigurationModule as ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { ElasticModule } from './elastic/elastic.module';
import { KafkaModule } from './kafka/kafka.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    ElasticModule,
    KafkaModule,
    OrderModule,
  ],
})
export class AppModule {}
