import { z } from 'zod';
import { OrderStatus } from '../entities/order.entity';

export const CreateOrderItemSchema = z.object({
  name: z.string(),
  quantity: z.number().min(1),
  price: z.number().positive(),
});

export const CreateOrderSchema = z.object({
  items: z.array(CreateOrderItemSchema),
  status: z.nativeEnum(OrderStatus).optional(),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
export type CreateOrderItemDto = z.infer<typeof CreateOrderItemSchema>;
