import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { GetConversationByDiscordChannelUsecase } from '../usecase/get-conversation-by-discord-channel/get-conversation-by-discord-channel.usecase';
import { OpenConversationByDiscordChannelUsecase } from '../usecase/open-conversation-by-discord-channel/open-conversation-by-discord-channel.usecase';
import { CloseConversationByDiscordChannelUsecase } from '../usecase/close-conversation-by-discord-channel/close-conversation-by-discord-channel.usecase';
import { ChangeModelByDiscordChannelUsecase } from '../usecase/change-model-by-discord-channel/change-model-by-discord-channel.usecase';

@Module({
  imports: [PrismaModule],
  exports: [
    GetConversationByDiscordChannelUsecase,
    OpenConversationByDiscordChannelUsecase,
    CloseConversationByDiscordChannelUsecase,
    ChangeModelByDiscordChannelUsecase,
  ],
  providers: [
    GetConversationByDiscordChannelUsecase,
    OpenConversationByDiscordChannelUsecase,
    CloseConversationByDiscordChannelUsecase,
    ChangeModelByDiscordChannelUsecase,
  ],
})
export class ConversationModule {}
