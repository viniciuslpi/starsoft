import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateOrderDto } from '../src/order/dtos/create-order.dto';
import { OrderStatus } from '../src/order/entities/order.entity';

describe('OrderController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let createdOrderId: string;

  it('should create an order', async () => {
    const createOrderDto: CreateOrderDto = {
      items: [
        { name: 'Item 1', quantity: 2, price: 10.0 },
        { name: 'Item 2', quantity: 1, price: 20.0 },
      ],
    };

    const res = await request(app.getHttpServer())
      .post('/orders')
      .send(createOrderDto)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.customerName).toBe('John Doe');
    createdOrderId = res.body.id;
  });

  it('should find the order by ID', async () => {
    const res = await request(app.getHttpServer())
      .get(`/orders/${createdOrderId}`)
      .expect(200);

    expect(res.body.id).toBe(createdOrderId);
    expect(res.body.customerName).toBe('John Doe');
  });

  it('should list all orders', async () => {
    const res = await request(app.getHttpServer()).get('/orders').expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((o) => o.id === createdOrderId)).toBe(true);
  });

  it('should update the order', async () => {
    const updateDto = {
      customerName: 'Jane Doe',
    };

    const res = await request(app.getHttpServer())
      .patch(`/orders/${createdOrderId}`)
      .send(updateDto)
      .expect(200);

    expect(res.body.customerName).toBe('Jane Doe');
  });

  it('should cancel the order', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/orders/${createdOrderId}/cancel`)
      .expect(200);

    expect(res.body.status).toBe(OrderStatus.CANCELLED);
  });

  it('should delete the order', async () => {
    await request(app.getHttpServer())
      .delete(`/orders/${createdOrderId}`)
      .expect(200);
  });
});
