import { NestFactory } from '@nestjs/core';
import { AppModule } from './infrastructure/infrastructure.module.js';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
