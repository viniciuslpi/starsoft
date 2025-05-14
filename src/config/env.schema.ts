import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  APP_NAME: z.string(),
  PORT: z.string().default('3000'),
  DB_HOST: z.string(),
  DB_PORT: z.string().regex(/^\d+$/),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
});

export type EnvSchema = z.infer<typeof envSchema>;
