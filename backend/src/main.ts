import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import * as helmet from 'helmet';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const helmetMiddleware: any = (helmet as any).default ?? (helmet as any);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3006',
      'http://localhost:3007',
      'http://localhost:4000',
      'http://202.131.1.82:4000',
      'http://altapp.mn',
      'https://altapp.mn',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.enableShutdownHooks();
  app.use(helmetMiddleware());
  app.use(compression());
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Gold App API')
    .setDescription('Алт худалдан авах системийн API баримт бичиг')
    .setVersion('1.0')
    .addTag('Auth')
    .addTag('User')
    .addTag('Wallet')
    .addTag('Purchase')
    .addTag('Gold Price')
    .addTag('News')
    .addTag('Chat')
    .addTag('Sell Request')
    .addTag('Admin')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((e) =>
          Object.values(e.constraints ?? {}),
        );
        return new BadRequestException({
          message: messages.join('; ') || 'Validation failed',
          errorCode: 'VALIDATION_ERROR',
        });
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`GoldApp API listening on http://localhost:${port}/api`);
}
bootstrap();
