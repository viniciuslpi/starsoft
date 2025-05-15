import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './schemas/create-order.dto';
import { UpdateOrderDto } from './schemas/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(data: CreateOrderDto) {
    const order = this.orderRepository.create(data);
    return await this.orderRepository.save(order);
  }

  async findAll() {
    return await this.orderRepository.find();
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    return order;
  }

  async update(id: string, data: UpdateOrderDto) {
    const order = await this.orderRepository.preload({ id, ...data });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    return this.orderRepository.save(order);
  }

  async remove(id: string) {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException('Pedido não encontrado');
    return this.orderRepository.remove(order);
  }

  async cancel(id: string) {
    const order = await this.orderRepository.findOneBy({ id });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    if (order.status === 'entregue') {
      throw new BadRequestException(
        'Pedido já foi entregue e não pode ser cancelado',
      );
    }

    if (order.status === 'cancelado') {
      throw new BadRequestException('Pedido já está cancelado');
    }

    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }
}
