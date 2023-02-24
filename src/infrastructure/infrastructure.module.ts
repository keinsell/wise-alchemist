import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { DiscordModule } from '../application/discord/discord.application.module';
import { LargeLanguageModelModule } from 'src/boundary-context/large-language-model/infra/large-language-model.module';
import { BullModule } from '@nestjs/bull';
import { LargeLanguageModelCompletionConsumer } from 'src/boundary-context/large-language-model/consumers/complete.consumer';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AfterMessageAuthorizedCustomer } from 'src/boundary-context/prompt/consumers/after.message-authorized.customer';
import { EventStorageConsumer } from './event-storage/event-storage.consumer';
import { EventStorageModule } from './event-storage/event-storage.module';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    PrismaModule,
    DiscordModule,
    LargeLanguageModelModule,
    EventStorageModule,
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  controllers: [],
  providers: [AfterMessageAuthorizedCustomer],
})
export class InfrastructureModule {}
