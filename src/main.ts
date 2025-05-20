import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { envSchema } from './config/env.schema';
import { setupSwagger } from './config/swagger.config';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http.exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const configService = app.get(ConfigService);
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    process.exit(1);
  }

  setupSwagger(app);

  const port = parseInt(configService.get<string>('PORT') || '3000', 10);
  await app.listen(port);

  Logger.log(`🚀 App running on http://localhost:${port}`);
  Logger.log(`📚 Swagger docs at http://localhost:${port}/api-docs`);
}
bootstrap();
