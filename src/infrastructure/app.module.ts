import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { DiscordModule } from '../application/discord/discord.module';
import { OnMessage } from 'src/application/discord/events/discord.on-message.event.js';
import { LargeLanguageModelModule } from 'src/boundary-context/large-language-model/infra/large-language-model.module';

@Module({
  imports: [PrismaModule, DiscordModule, LargeLanguageModelModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
