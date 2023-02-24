import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { DiscordModule } from '../application/discord/discord.application.module';
import { LargeLanguageModelModule } from 'src/boundary-context/completion/infrastructure/large-language-model.module';
import { BullModule } from '@nestjs/bull';
import { LargeLanguageModelCompletionConsumer } from 'src/boundary-context/completion/processors/complete.consumer';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AfterMessageAuthorizedCustomer } from 'src/boundary-context/prompt/consumers/after.message-authorized.customer';
import { EventStorageConsumer } from './event-storage/event-storage.consumer';
import { EventStorageModule } from './event-storage/event-storage.module';
import { PromptModule } from 'src/boundary-context/prompt/infrastructure/prompt.module';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    PrismaModule,
    DiscordModule,
    LargeLanguageModelModule,
    PromptModule,
    EventStorageModule,
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class InfrastructureModule {}
