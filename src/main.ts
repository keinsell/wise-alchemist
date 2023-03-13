import { NestFactory } from '@nestjs/core';
import { InfrastructureModule } from './infrastructure/infrastructure.module.js';
import * as Sentry from '@sentry/node';
import { Integrations } from '@sentry/tracing';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { PrismaService } from './infrastructure/prisma/prisma.infra';
import { SentryInterceptor } from './infrastructure/sentry/sentry.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(InfrastructureModule);
  const primsa = app.get(PrismaService);

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    integrations: [
      new ProfilingIntegration(),
      new Integrations.Prisma({ client: primsa }),
    ],
  });

  app.useGlobalInterceptors(new SentryInterceptor());

  await app.listen(3000);
}

bootstrap();
