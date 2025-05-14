import { z } from 'zod';
import { CreateOrderItemSchema, CreateOrderSchema } from './create-order.dto';

export const UpdateOrderItemSchema = CreateOrderItemSchema.partial();

export const UpdateOrderSchema = CreateOrderSchema.partial();

export type UpdateOrderDto = z.infer<typeof UpdateOrderSchema>;
export type UpdateOrderItemDto = z.infer<typeof UpdateOrderItemSchema>;
