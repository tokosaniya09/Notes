import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Frontend communication
  app.enableCors({
    origin: true, // Allow all origins in development. Restrict in production.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Use Winston for system logging
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Global Config Access
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');

  // Global Validation Pipeline
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error if extra properties exist
      transform: true, // Auto-transform payloads to DTO instances
    }),
  );

  // Global Exception Handling
  app.useGlobalFilters(new HttpExceptionFilter());

  // Graceful Shutdown
  app.enableShutdownHooks();

  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();