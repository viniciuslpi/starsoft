import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ElasticService } from '../elastic/elastic.service';
import { KafkaService } from '../kafka/kafka.service';
import { AppLogger } from '../common/logger/app.logger';

const mockOrderRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
  preload: jest.fn(),
  remove: jest.fn(),
};

const mockElasticService = {
  indexOrder: jest.fn(),
  findAll: jest.fn(),
  removeOrder: jest.fn(),
};

const mockKafkaService = {
  emit: jest.fn(),
};

const mockLogger = {
  logBusiness: jest.fn(),
};

describe('OrderService', () => {
  let service: OrderService;
  let repository: Repository<Order>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: ElasticService,
          useValue: mockElasticService,
        },
        {
          provide: KafkaService,
          useValue: mockKafkaService,
        },
        {
          provide: AppLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    repository = module.get<Repository<Order>>(getRepositoryToken(Order));
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create, index, emit event and log', async () => {
      const dto = { customerName: 'John', items: [] };
      const mockSavedOrder = {
        id: '1',
        status: OrderStatus.PENDING,
        createdAt: new Date(),
        ...dto,
      };

      mockOrderRepository.create.mockReturnValue(dto);
      mockOrderRepository.save.mockResolvedValue(mockSavedOrder);

      const result = await service.create(dto as any);

      expect(mockOrderRepository.create).toHaveBeenCalledWith(dto);
      expect(mockOrderRepository.save).toHaveBeenCalledWith(dto);
      expect(mockElasticService.indexOrder).toHaveBeenCalledWith(
        mockSavedOrder,
      );
      expect(mockKafkaService.emit).toHaveBeenCalledWith('order_created', {
        id: mockSavedOrder.id,
        status: mockSavedOrder.status,
        createdAt: mockSavedOrder.createdAt,
        items: mockSavedOrder.items,
      });
      expect(mockLogger.logBusiness).toHaveBeenCalledWith('order_created', {
        id: mockSavedOrder.id,
      });
      expect(result).toEqual(mockSavedOrder);
    });
  });

  describe('findOne', () => {
    it('should return order and log if found', async () => {
      const mockOrder = { id: '1' };
      mockOrderRepository.findOneBy.mockResolvedValue(mockOrder);

      const result = await service.findOne('1');

      expect(result).toEqual(mockOrder);
      expect(mockLogger.logBusiness).toHaveBeenCalledWith('order_fetched', {
        id: '1',
      });
    });

    it('should throw if not found', async () => {
      mockOrderRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should search orders and log', async () => {
      const query = { search: 'pizza' };
      const mockResult = [{ id: '1' }];

      mockElasticService.findAll.mockResolvedValue(mockResult);

      const result = await service.findAll(query);

      expect(mockElasticService.findAll).toHaveBeenCalledWith(query);
      expect(mockLogger.logBusiness).toHaveBeenCalledWith('order_search', {
        query,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('update', () => {
    it('should update, index, emit event and log', async () => {
      const dto = { status: OrderStatus.SHIPPED };
      const mockOrder = {
        id: '1',
        updatedAt: new Date(),
        ...dto,
      };

      mockOrderRepository.preload.mockResolvedValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);

      const result = await service.update('1', dto as any);

      expect(mockOrderRepository.preload).toHaveBeenCalledWith({
        id: '1',
        ...dto,
      });
      expect(mockElasticService.indexOrder).toHaveBeenCalledWith(mockOrder);
      expect(mockKafkaService.emit).toHaveBeenCalledWith(
        'order_status_updated',
        {
          id: mockOrder.id,
          status: mockOrder.status,
          updatedAt: mockOrder.updatedAt,
        },
      );
      expect(mockLogger.logBusiness).toHaveBeenCalledWith('order_updated', {
        id: '1',
        status: OrderStatus.SHIPPED,
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw if order not found', async () => {
      mockOrderRepository.preload.mockResolvedValue(null);

      await expect(service.update('1', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cancel', () => {
    it('should cancel, index, emit event and log', async () => {
      const mockOrder = {
        id: '1',
        status: OrderStatus.PENDING,
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockOrder as any);
      mockOrderRepository.save.mockResolvedValueOnce({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      });

      const result = await service.cancel('1');

      expect(result.status).toEqual(OrderStatus.CANCELLED);
      expect(mockElasticService.indexOrder).toHaveBeenCalledWith(result);
      expect(mockKafkaService.emit).toHaveBeenCalledWith(
        'order_status_updated',
        {
          id: result.id,
          status: result.status,
          updatedAt: result.updatedAt,
        },
      );
      expect(mockLogger.logBusiness).toHaveBeenCalledWith('order_cancelled', {
        id: result.id,
      });
    });

    it('should throw if order is already delivered', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce({
        id: '1',
        status: OrderStatus.DELIVERED,
      } as any);

      await expect(service.cancel('1')).rejects.toThrow(BadRequestException);
    });

    it('should throw if order is already cancelled', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce({
        id: '1',
        status: OrderStatus.CANCELLED,
      } as any);

      await expect(service.cancel('1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove, de-index and log', async () => {
      const mockOrder = { id: '1' };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockOrder as any);
      mockOrderRepository.remove.mockResolvedValueOnce(mockOrder);

      const result = await service.remove('1');

      expect(mockOrderRepository.remove).toHaveBeenCalledWith(mockOrder);
      expect(mockElasticService.removeOrder).toHaveBeenCalledWith('1');
      expect(mockLogger.logBusiness).toHaveBeenCalledWith('order_removed', {
        id: '1',
      });
      expect(result).toEqual(mockOrder);
    });
  });
});
