import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('OrderController (e2e)', () => {
  let app: INestApplication;
  let createdOrderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('(POST) /orders - should create a new order', async () => {
    const response = await request(app.getHttpServer())
      .post('/orders')
      .send({
        items: [
          { name: 'Produto 1', quantity: 2, price: 50 },
          { name: 'Produto 2', quantity: 1, price: 100 },
        ],
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.items.length).toBe(2);
    createdOrderId = response.body.id;
  });

  it('(GET) /orders - should list all orders', async () => {
    const response = await request(app.getHttpServer())
      .get('/orders')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('(GET) /orders/:id - should return a specific order', async () => {
    const response = await request(app.getHttpServer())
      .get(`/orders/${createdOrderId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', createdOrderId);
  });

  it('(PATCH) /orders/:id - should update order status', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/orders/${createdOrderId}`)
      .send({ status: 'processando' })
      .expect(200);

    expect(response.body.status).toBe('processando');
  });

  it('(PATCH) /orders/:id/cancel - should cancel the order', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/orders/${createdOrderId}/cancel`)
      .expect(200);

    expect(response.body.status).toBe('cancelado');
  });

  it('(DELETE) /orders/:id - should delete the order', async () => {
    await request(app.getHttpServer())
      .delete(`/orders/${createdOrderId}`)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
