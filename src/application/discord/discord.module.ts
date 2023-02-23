import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { DiscordOnMessageEvent } from './events/discord.on-message.event';
import { AccountModule } from 'src/boundary-context/account/account.module';
import { ConversationModule } from 'src/boundary-context/conversation/conversation.module';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';

@Module({
  imports: [AccountModule, ConversationModule],
  exports: [DiscordService],
  providers: [DiscordService, DiscordOnMessageEvent],
})
export class DiscordModule {}
