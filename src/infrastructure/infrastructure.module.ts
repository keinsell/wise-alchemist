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
    BullModule.forRoot({
      redis: process.env.REDIS_URL,
    }),
  ],
  controllers: [],
  providers: [],
})
export class InfrastructureModule {}
