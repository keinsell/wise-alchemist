import { Injectable } from '@nestjs/common';
import { CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';
import { CloseConversationByDiscordChannelUsecase } from 'src/boundary-context/conversation/usecase/close-conversation-by-discord-channel/close-conversation-by-discord-channel.usecase';

@Discord()
@Injectable()
export class DiscordConversationCommand {
  constructor(
    private closeConversation: CloseConversationByDiscordChannelUsecase,
  ) {}
  @Slash({ description: 'Close actual conversation.', name: 'close' })
  async close(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const conversation = await this.closeConversation.execute({
      channelId: interaction.channelId!,
      accountId: interaction.user.id,
    });

    if (conversation._tag === 'Left') {
      return await interaction.editReply(`Error: ${conversation.left.message}`);
    }

    await interaction.editReply(
      `Conversation ${conversation.right.id} closed. Conversation contained ${conversation.right.messagesCount} messages and used ${conversation.right.tokensCount} tokens.`,
    );
  }
}
