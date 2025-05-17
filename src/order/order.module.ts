import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ElasticModule } from 'src/elastic/elastic.module';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    ElasticModule,
    KafkaModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
