import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockOrder = {
  id: '1',
  status: OrderStatus.PENDING,
  items: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('OrderService', () => {
  let service: OrderService;
  let repo: jest.Mocked<Repository<Order>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            findOne: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    repo = module.get(getRepositoryToken(Order));
  });

  it('should create an order', async () => {
    const dto = { items: [] };
    repo.create.mockReturnValue(mockOrder as Order);
    repo.save.mockResolvedValue(mockOrder as Order);

    const result = await service.create(dto);
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockOrder);
  });

  it('should find all orders', async () => {
    repo.find.mockResolvedValue([mockOrder as Order]);
    const result = await service.findAll();
    expect(result).toEqual([mockOrder]);
  });

  it('should find one order', async () => {
    repo.findOneBy.mockResolvedValue(mockOrder as Order);
    const result = await service.findOne('1');
    expect(result).toEqual(mockOrder);
  });

  it('should throw if order not found in findOne', async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
  });

  it('should update an order', async () => {
    const updated = { ...mockOrder, status: OrderStatus.SHIPPED };
    repo.preload.mockResolvedValue(updated as Order);
    repo.save.mockResolvedValue(updated as Order);

    const result = await service.update('1', { status: OrderStatus.SHIPPED });
    expect(result).toEqual(updated);
  });

  it('should remove an order', async () => {
    repo.findOneBy.mockResolvedValue(mockOrder as Order);
    repo.remove.mockResolvedValue(mockOrder as Order);

    const result = await service.remove('1');
    expect(result).toEqual(mockOrder);
  });

  it('should cancel an order', async () => {
    const order = { ...mockOrder, status: OrderStatus.PENDING };
    repo.findOneBy.mockResolvedValue(order as Order);
    repo.save.mockResolvedValue({ ...order, status: OrderStatus.CANCELLED });

    const result = await service.cancel('1');
    expect(result.status).toEqual(OrderStatus.CANCELLED);
  });

  it('should throw if order already delivered in cancel', async () => {
    const order = { ...mockOrder, status: OrderStatus.DELIVERED };
    repo.findOneBy.mockResolvedValue(order as Order);
    await expect(service.cancel('1')).rejects.toThrow(BadRequestException);
  });

  it('should throw if order already cancelled', async () => {
    const order = { ...mockOrder, status: OrderStatus.CANCELLED };
    repo.findOneBy.mockResolvedValue(order as Order);
    await expect(service.cancel('1')).rejects.toThrow(BadRequestException);
  });

  it('should throw if order not found in cancel', async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(service.cancel('1')).rejects.toThrow(NotFoundException);
  });
});
