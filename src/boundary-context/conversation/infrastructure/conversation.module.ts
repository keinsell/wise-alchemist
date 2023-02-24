import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { GetConversationByDiscordChannelUsecase } from '../usecase/get-conversation-by-discord-channel/get-conversation-by-discord-channel.usecase';
import { OpenConversationByDiscordChannelUsecase } from '../usecase/open-conversation-by-discord-channel/open-conversation-by-discord-channel.usecase';

@Module({
  imports: [PrismaModule],
  exports: [
    GetConversationByDiscordChannelUsecase,
    OpenConversationByDiscordChannelUsecase,
  ],
  providers: [
    GetConversationByDiscordChannelUsecase,
    OpenConversationByDiscordChannelUsecase,
  ],
})
export class ConversationModule {}
