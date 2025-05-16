import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
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

  async removeOrder(id: string): Promise<any> {
    return this.elasticsearchService.delete({
      index: this.index,
      id,
    });
  }

  async searchOrder(term: string) {
    const { hits } = await this.elasticsearchService.search<Order>({
      index: this.index,
      query: {
        multi_match: {
          query: term,
          fields: ['id', 'status', 'items.name'],
        },
      },
    });

    return hits.hits.map((hit) => hit._source);
  }

  async updateOrder(order: any) {
    await this.elasticsearchService.update({
      index: 'orders',
      id: order.id,
      doc: order,
    });
  }
}
