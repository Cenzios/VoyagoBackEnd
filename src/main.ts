import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { logger } from './logger';

import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const nestLogger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3000;
  const apiPrefix = configService.get<string>('apiPrefix') ?? 'api/v1';

  // Security
  app.use(helmet());

  // Compression
  app.use(compression());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Logger
  // app.useLogger({
  //   log: (msg) => logger.info(msg),
  //   error: (msg) => logger.error(msg),
  //   warn: (msg) => logger.warn(msg),
  //   debug: (msg) => logger.debug(msg),
  //   verbose: (msg) => logger.trace(msg),
  // });

  await app.listen(port);

  nestLogger.log(
    `🚀 Application is running on: http://localhost:${port}/${apiPrefix}`,
  );
  nestLogger.log(
    `📚 Health check available at: http://localhost:${port}/${apiPrefix}/health`,
  );
}

bootstrap();
