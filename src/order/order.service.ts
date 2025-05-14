import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './schemas/create-order.dto';
import { UpdateOrderDto } from './schemas/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  create(data: CreateOrderDto) {
    const order = this.orderRepository.create(data);
    return this.orderRepository.save(order);
  }

  findAll() {
    return this.orderRepository.find();
  }

  findOne(id: string) {
    return this.orderRepository.findOneBy({ id });
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
}
