import { NestFactory } from '@nestjs/core';
import { InfrastructureModule } from './infrastructure/infrastructure.module.js';
import { MezmoLogger } from './infrastructure/logger/mezmo-logger-service';

async function bootstrap() {
  const app = await NestFactory.create(InfrastructureModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(MezmoLogger));
  await app.listen(3000);
}

bootstrap();
