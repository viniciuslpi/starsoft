import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { ElasticService } from '../elastic/elastic.service';
import { SearchOrdersQueryDto } from './dtos/find-all-query.dto';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly elasticService: ElasticService,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(data: CreateOrderDto) {
    const order = this.orderRepository.create(data);
    const saved = await this.orderRepository.save(order);

    await this.elasticService.indexOrder(saved);

    await this.kafkaService.emit('order_created', {
      id: saved.id,
      status: saved.status,
      createdAt: saved.createdAt,
      items: saved.items,
    });

    return saved;
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    return order;
  }

  async findAll(query: SearchOrdersQueryDto) {
    return await this.elasticService.findAll(query);
  }

  async update(id: string, data: UpdateOrderDto) {
    const order = await this.orderRepository.preload({ id, ...data });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    await this.elasticService.indexOrder(order);
    const updated = await this.orderRepository.save(order);

    await this.kafkaService.emit('order_status_updated', {
      id: updated.id,
      status: updated.status,
      updatedAt: updated.updatedAt,
    });

    return updated;
  }

  async cancel(id: string) {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException(
        'Pedido já foi entregue e não pode ser cancelado',
      );
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Pedido já está cancelado');
    }

    order.status = OrderStatus.CANCELLED;

    await this.elasticService.indexOrder(order);
    const cancelled = await this.orderRepository.save(order);

    await this.kafkaService.emit('order_status_updated', {
      id: cancelled.id,
      status: cancelled.status,
      updatedAt: cancelled.updatedAt,
    });

    return cancelled;
  }

  async remove(id: string) {
    const order = await this.findOne(id);

    await this.orderRepository.remove(order);
    await this.elasticService.removeOrder(id);

    return order;
  }
}
