import { ZodSchema } from 'zod';
import { BadRequestException } from '@nestjs/common';

export function zodValidator<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const formattedErrors = result.error.format();

    throw new BadRequestException({
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  return result.data;
}
