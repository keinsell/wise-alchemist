import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { DiscordModule } from '../application/discord/discord.module';
import { LargeLanguageModelModule } from 'src/boundary-context/large-language-model/infra/large-language-model.module';
import { BullModule } from '@nestjs/bull';
import { CompletionConsumer } from 'src/boundary-context/large-language-model/consumers/complete.consumer';

@Module({
  imports: [
    PrismaModule,
    DiscordModule,
    LargeLanguageModelModule,
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    CompletionConsumer,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
