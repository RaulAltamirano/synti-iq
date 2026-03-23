import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from './core/app.module';
import { Logger as NestLogger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/pagination/dtos/paginated-response.dto';
import * as cookieParser from 'cookie-parser';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { initializeOpenTelemetry } from './shared/observability/opentelemetry.config';
import { RequestIdMiddleware } from './shared/interceptors/request-id.middleware';

initializeOpenTelemetry();

function createSwaggerConfig(): ReturnType<DocumentBuilder['build']> {
  const apiUrl = process.env.API_URL || 'http://localhost:3000/api';
  return new DocumentBuilder()
    .setTitle('Synti IQ E-commerce API')
    .setDescription(
      'API for managing store schedules, cashiers, products, inventory, statistics, and shipping operations',
    )
    .setVersion('1.0')
    .addServer(apiUrl, 'Development')
    .addTag('Auth', 'Authentication and session management')
    .addTag('Users', 'User profile management')
    .addTag('User Session', 'Active sessions and device management')
    .addTag('Referral', 'Referral codes and benefits')
    .addTag('Store', 'Store management')
    .addTag('StoreSchedule', 'Store hours and availability management')
    .addTag('Product', 'Product catalog and management')
    .addTag('Inventory', 'Stock and inventory control')
    .addTag('Location', 'Shipping and billing addresses')
    .addTag('CashierSchedule', 'Cashier shift scheduling and management')
    .addTag('Statistics', 'Sales analytics and reporting')
    .addTag('Shipping', 'Order fulfillment and delivery tracking')
    .addCookieAuth('access_token')
    .addSecurity('api_key', { type: 'apiKey', name: 'x-api-key', in: 'header' })
    .build();
}

function setupSwagger(app: INestApplication): void {
  const config = createSwaggerConfig();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [PaginatedResponseDto],
  });
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: false, tagsSorter: 'alpha', operationsSorter: 'alpha' },
    customSiteTitle: 'Synti IQ API Documentation',
  });
}

function applyGlobalConfig(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Requested-With', 'X-Request-ID'],
    exposedHeaders: ['Set-Cookie', 'X-Request-ID', 'Trace-Id', 'Span-Id'],
  });
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.use(cookieParser());
  const requestIdMiddleware = new RequestIdMiddleware();
  app.use(requestIdMiddleware.use.bind(requestIdMiddleware));
  setupSwagger(app);
  applyGlobalConfig(app);
  await app.listen(3000);
  const logger = new NestLogger('Bootstrap');
  logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
  logger.log(`📚 Swagger documentation: ${await app.getUrl()}/api/docs`);
}

bootstrap().catch(err => {
  // eslint-disable-next-line no-console
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
