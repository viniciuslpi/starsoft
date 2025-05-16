import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchOrdersQueryDto } from 'src/order/dtos/find-all-query.dto';
import { Order } from 'src/order/entities/order.entity';

@Injectable()
export class ElasticService {
  private readonly index = 'orders';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexOrder(order: Order): Promise<any> {
    return this.elasticsearchService.index<Order>({
      index: this.index,
      id: order.id,
      document: order,
    });
  }

  async findById(id: string): Promise<any> {
    try {
      const result = await this.elasticsearchService.get({
        index: 'orders',
        id,
      });
      return result._source;
    } catch (error) {
      if (error.meta?.statusCode === 404) return null;
      throw error;
    }
  }

  async findAll(query: SearchOrdersQueryDto) {
    const { search, status, startDate, endDate } = query;

    const must: any[] = [];

    if (search) {
      must.push({
        multi_match: {
          query: search,
          fields: ['id', 'items.name'],
        },
      });
    }

    if (status) {
      must.push({ match: { status: status } });
    }

    if (startDate && endDate) {
      must.push({
        range: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });
    }

    const result = await this.elasticsearchService.search({
      index: 'orders',
      query: {
        bool: {
          must,
        },
      },
    });

    return result.hits.hits.map((hit) => hit._source);
  }

  async removeOrder(id: string): Promise<any> {
    return this.elasticsearchService.delete({
      index: this.index,
      id,
    });
  }

  async updateOrder(order: any) {
    await this.elasticsearchService.update({
      index: 'orders',
      id: order.id,
      doc: order,
    });
  }
}
