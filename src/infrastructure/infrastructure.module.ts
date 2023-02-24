import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { DiscordModule } from '../application/discord/discord.application.module';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AfterMessageAuthorizedCustomer } from 'src/boundary-context/prompt/consumers/after.message-authorized.consumer';
import { EventStorageConsumer } from './event-storage/event-storage.consumer';
import { EventStorageModule } from './event-storage/event-storage.module';
import { PromptModule } from 'src/boundary-context/prompt/infrastructure/prompt.module';
import { CompletionModule } from 'src/boundary-context/completion/infrastructure/completion.module';
import * as redisurl from 'redis-url';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    PrismaModule,
    DiscordModule,
    PromptModule,
    EventStorageModule,
    CompletionModule,
    BullModule.forRootAsync({
      useFactory: () => {
        const redisConfig = redisurl.parse(process.env.REDIS_URL);
        return {
          redis: {
            host: redisConfig.hostname,
            port: redisConfig.port,
            username: redisConfig.username, // if you have authentication enabled
            password: redisConfig.password, // if you have authentication enabled
            db: redisConfig.database || 0, // select a database or use 0 as default
            retryStrategy: (times) => {
              console.log('could not connect to redis!');
              process.exit(1);
            },
            enableReadyCheck: false,
          },
        };
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class InfrastructureModule {}
