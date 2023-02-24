import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { DiscordOnMessageEvent } from './events/discord.on-message.event';
import { AccountModule } from 'src/boundary-context/account/account.module';
import { ConversationModule } from 'src/boundary-context/conversation/conversation.module';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { MessageModule } from 'src/boundary-context/message/message.module';

@Module({
  imports: [AccountModule, ConversationModule, MessageModule],
  exports: [DiscordService],
  providers: [DiscordService, DiscordOnMessageEvent],
})
export class DiscordModule {}
