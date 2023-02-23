import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { DiscordModule } from './discord/discord.module.js';
import { OnMessage } from 'src/application/discord/events/discord.on-message.event.js';
import { LargeLanguageModelModule } from 'src/boundary-context/large-language-model/large-language-model.module';

@Module({
  imports: [PrismaModule, DiscordModule, LargeLanguageModelModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
