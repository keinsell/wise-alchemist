import { Module } from '@nestjs/common';
import { AccountService } from 'src/boundary-context/account/account.service';
import { ConversationService } from 'src/boundary-context/conversation/conversation.service';
import { DiscordModule } from 'src/infrastructure/discord/discord.module';
import { OnMessage } from './events/discord.on-message.event';

@Module({
  imports: [DiscordModule],
  exports: [],
  providers: [AccountService, ConversationService, OnMessage],
})
export class DiscordApplicationModule {}
