import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { DiscordOnMessageEvent } from './events/discord.on-message.event';
import { AccountModule } from 'src/boundary-context/account/account.module';
import { ConversationModule } from 'src/boundary-context/conversation/infrastructure/conversation.module';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { MessageModule } from 'src/boundary-context/message/infrastructure/message.module';
import { BullModule } from '@nestjs/bull';
import { LargeLanguageModelModule } from 'src/boundary-context/completion/infrastructure/large-language-model.module';

@Module({
  imports: [
    AccountModule,
    ConversationModule,
    MessageModule,
    // BullModule.registerQueue({
    //   name: 'large_language_model.complete',
    // }),
    LargeLanguageModelModule,
  ],
  exports: [DiscordService],
  providers: [DiscordService, DiscordOnMessageEvent],
})
export class DiscordModule {}
