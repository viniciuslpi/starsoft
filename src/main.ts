import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { envSchema } from './config/env.schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const configService = app.get(ConfigService);
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    process.exit(1);
  }

  const port = parseInt(configService.get<string>('PORT') || '3000', 10);
  await app.listen(port);

  Logger.log(`🚀 App running on http://localhost:${port}`);
}
bootstrap();
