import { NestFactory } from '@nestjs/core';
import { AppModule } from './core/app.module';
import { Logger, ValidationPipe, ConsoleLogger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { initializeOpenTelemetry } from './shared/observability/opentelemetry.config';
import { RequestIdMiddleware } from './shared/interceptors/request-id.middleware';

initializeOpenTelemetry();

class CustomLogger extends ConsoleLogger {
  log(message: string, context?: string) {
    if (
      context === 'InstanceLoader' ||
      context === 'RouterExplorer' ||
      context === 'RoutesResolver'
    ) {
      return;
    }
    super.log(message, context);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger(),
  });

  app.use(cookieParser());

  const requestIdMiddleware = new RequestIdMiddleware();
  app.use(requestIdMiddleware.use.bind(requestIdMiddleware));

  const config = new DocumentBuilder()
    .setTitle('Synti IQ E-commerce API')
    .setDescription(
      'API for managing store schedules, cashiers, products, inventory, statistics, and shipping operations',
    )
    .setVersion('1.0')
    .addTag('store-schedule', 'Store hours and availability management')
    .addTag('cashier-schedule', 'Cashier shift scheduling and management')
    .addTag('products', 'Product catalog and management')
    .addTag('inventory', 'Stock and inventory control')
    .addTag('statistics', 'Sales analytics and reporting')
    .addTag('shipping', 'Order fulfillment and delivery tracking')
    .addBearerAuth()
    .addSecurity('api_key', {
      type: 'apiKey',
      name: 'x-api-key',
      in: 'header',
    })

    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Synti IQ API Documentation',
  });

  app.setGlobalPrefix('api');
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

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
    exposedHeaders: ['Set-Cookie', 'X-Request-ID', 'Trace-Id', 'Span-Id'],
  });

  await app.listen(3000);
  const logger = new Logger('Bootstrap');
  logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
  logger.log(`📚 Swagger documentation: ${await app.getUrl()}/api/docs`);
}
bootstrap();
