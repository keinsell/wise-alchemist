import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { DiscordOnMessageEvent } from './events/discord.on-message.event';
import { AccountModule } from 'src/boundary-context/account/account.module';
import { ConversationModule } from 'src/boundary-context/conversation/infrastructure/conversation.module';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { MessageModule } from 'src/boundary-context/message/infrastructure/message.module';
import { BullModule } from '@nestjs/bull';
import { AfterMessageCreatedConsumer } from './conusmers/after.message-created.consumer';

@Module({
  imports: [AccountModule, ConversationModule, MessageModule, PrismaModule],
  exports: [DiscordService],
  providers: [
    DiscordService,
    DiscordOnMessageEvent,
    AfterMessageCreatedConsumer,
  ],
})
export class DiscordModule {}
