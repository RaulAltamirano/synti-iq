import { NestFactory } from '@nestjs/core';
import { AppModule } from './core/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

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
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
  });

  await app.listen(3000);
  Logger.log(`Swagger documentation is available at: ${await app.getUrl()}/api/docs`);
}
bootstrap();
