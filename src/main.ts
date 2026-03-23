import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from './core/app.module';
import { Logger as NestLogger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/pagination/dtos/paginated-response.dto';
import { ReferralRecordDto } from 'src/referral/dto/referral-record.dto';
import * as cookieParser from 'cookie-parser';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { initializeOpenTelemetry } from './shared/observability/opentelemetry.config';
import { RequestIdMiddleware } from './shared/interceptors/request-id.middleware';

initializeOpenTelemetry();

const SWAGGER_PATH = 'api/docs';
const SWAGGER_TITLE = 'SyntiIQ API';

const SWAGGER_TAGS = [
  ['Auth', 'Authentication, login, 2FA and sessions'],
  ['Users', 'User profiles'],
  ['User Session', 'Active sessions and devices'],
  ['Referral', 'Referral codes and benefits'],
  ['Store', 'Stores and cashiers'],
  ['StoreSchedule', 'Store hours and availability'],
  ['Product', 'Product catalog'],
  ['Inventory', 'Stock and inventory'],
  ['Location', 'Shipping and billing addresses'],
  ['CashierSchedule', 'Cashier shifts and assignments'],
  ['Statistics', 'Sales analytics and reporting'],
  ['Shipping', 'Order fulfillment and tracking'],
] as const;

function createSwaggerConfig(): ReturnType<DocumentBuilder['build']> {
  const baseUrl = process.env.API_URL || 'http://localhost:3000/api';
  const builder = new DocumentBuilder()
    .setTitle(SWAGGER_TITLE)
    .setDescription(
      'REST API for store management, cashiers, products, inventory, statistics, and shipping operations.',
    )
    .setVersion('1.0')
    .addServer(baseUrl, 'Local / Development');

  if (process.env.API_URL_STAGING) {
    builder.addServer(process.env.API_URL_STAGING, 'Staging');
  }

  for (const [name, desc] of SWAGGER_TAGS) {
    builder.addTag(name, desc);
  }

  return builder
    .addCookieAuth('access_token')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api_key')
    .build();
}

function setupSwagger(app: INestApplication): void {
  const config = createSwaggerConfig();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [PaginatedResponseDto, ReferralRecordDto],
  });
  (document.components ??= {}).schemas ??= {};
  (document.components.schemas as Record<string, unknown>)['ApiErrorDto'] = {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'error' },
      message: { type: 'string', example: 'Bad Request' },
      code: { type: 'string', example: 'BAD_REQUEST' },
      data: { type: 'object', nullable: true, description: 'Always null on error' },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: { type: 'string' },
            code: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
      meta: {
        type: 'object',
        properties: {
          requestId: { type: 'string' },
          traceId: { type: 'string' },
          spanId: { type: 'string' },
          timestamp: { type: 'string' },
          path: { type: 'string' },
          statusCode: { type: 'number' },
        },
      },
    },
  };
  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'list',
    },
    customSiteTitle: `${SWAGGER_TITLE} — Documentation`,
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
  logger.log(`📚 Swagger: ${await app.getUrl()}/${SWAGGER_PATH}`);
}

bootstrap().catch(err => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
