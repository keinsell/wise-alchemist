import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { DiscordOnMessageEvent } from './listeners/discord.on-message.listener';
import { AccountModule } from 'src/boundary-context/account/account.module';
import { ConversationModule } from 'src/boundary-context/conversation/infrastructure/conversation.module';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { MessageModule } from 'src/boundary-context/message/infrastructure/message.module';
import { AfterMessageCreatedConsumer } from './conusmers/after.message-created.consumer';
import { AfterDiscordStartTypingConsumer } from './conusmers/after.discord-start-typing.consumer';
import { AfterDiscordStopTypingConsumer } from './conusmers/after.discord-stop-typing.consumer';

@Module({
  imports: [AccountModule, ConversationModule, MessageModule, PrismaModule],
  exports: [DiscordService],
  providers: [
    DiscordService,
    DiscordOnMessageEvent,
    AfterMessageCreatedConsumer,
    AfterDiscordStartTypingConsumer,
    AfterDiscordStopTypingConsumer,
  ],
})
export class DiscordModule {}
