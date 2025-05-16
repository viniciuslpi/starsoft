import { Test, TestingModule } from '@nestjs/testing';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ElasticService } from './elastic.service';
import { SearchOrdersQueryDto } from 'src/order/dtos/find-all-query.dto';

describe('ElasticService', () => {
  let service: ElasticService;
  let elasticsearchService: ElasticsearchService;

  const mockElasticsearchService = {
    index: jest.fn(),
    get: jest.fn(),
    search: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElasticService,
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService,
        },
      ],
    }).compile();

    service = module.get<ElasticService>(ElasticService);
    elasticsearchService =
      module.get<ElasticsearchService>(ElasticsearchService);
    jest.clearAllMocks();
  });

  describe('indexOrder', () => {
    it('should index an order', async () => {
      const mockOrder = { id: '1', status: 'pending' };
      mockElasticsearchService.index.mockResolvedValueOnce({});

      await service.indexOrder(mockOrder as any);

      expect(elasticsearchService.index).toHaveBeenCalledWith({
        index: 'orders',
        id: mockOrder.id,
        document: mockOrder,
      });
    });
  });

  describe('findById', () => {
    it('should return an order if found', async () => {
      const mockResult = { _source: { id: '1' } };
      mockElasticsearchService.get.mockResolvedValueOnce(mockResult);

      const result = await service.findById('1');
      expect(result).toEqual(mockResult._source);
    });

    it('should return null if not found', async () => {
      const error = { meta: { statusCode: 404 } };
      mockElasticsearchService.get.mockRejectedValueOnce(error);

      const result = await service.findById('nonexistent');
      expect(result).toBeNull();
    });

    it('should throw error for other issues', async () => {
      const error = { meta: { statusCode: 500 } };
      mockElasticsearchService.get.mockRejectedValueOnce(error);

      await expect(service.findById('1')).rejects.toEqual(error);
    });
  });

  describe('findAll', () => {
    it('should perform a search with filters', async () => {
      const dto: SearchOrdersQueryDto = {
        search: 'pizza',
        status: 'delivered',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      const mockHit = {
        hits: {
          hits: [{ _source: { id: '1', status: 'delivered' } }],
        },
      };
      mockElasticsearchService.search.mockResolvedValueOnce(mockHit);

      const result = await service.findAll(dto);

      expect(elasticsearchService.search).toHaveBeenCalledWith({
        index: 'orders',
        query: {
          bool: {
            must: expect.any(Array),
          },
        },
      });
      expect(result).toEqual([{ id: '1', status: 'delivered' }]);
    });
  });

  describe('removeOrder', () => {
    it('should delete an order by id', async () => {
      mockElasticsearchService.delete.mockResolvedValueOnce({});
      await service.removeOrder('1');

      expect(elasticsearchService.delete).toHaveBeenCalledWith({
        index: 'orders',
        id: '1',
      });
    });
  });

  describe('updateOrder', () => {
    it('should update an order', async () => {
      const mockOrder = { id: '1', status: 'updated' };
      mockElasticsearchService.update.mockResolvedValueOnce({});

      await service.updateOrder(mockOrder);

      expect(elasticsearchService.update).toHaveBeenCalledWith({
        index: 'orders',
        id: '1',
        doc: mockOrder,
      });
    });
  });
});
