import { Injectable } from '@nestjs/common';
import { CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';
import { CloseConversationByDiscordChannelUsecase } from 'src/boundary-context/conversation/usecase/close-conversation-by-discord-channel/close-conversation-by-discord-channel.usecase';
import { ChangeModelByDiscordChannelUsecase } from '../../../boundary-context/conversation/usecase/change-model-by-discord-channel/change-model-by-discord-channel.usecase';
import { AccountService } from '../../../boundary-context/account/account.service';
import { ChatgptModel } from '../../../boundary-context/completion/providers/content-generation/chatgpt/chatgpt.model';

@Discord()
@Injectable()
export class DiscordConversationCommand {
  constructor(
    private closeConversation: CloseConversationByDiscordChannelUsecase,
    private changeConversation: ChangeModelByDiscordChannelUsecase,
    private accountService: AccountService,
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

  @Slash({
    description: 'Use the fastest model for conversation.',
    name: 'fast',
  })
  async turbo(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const account = await this.accountService.authenticateAccountByDiscordId(
      interaction.user.id,
    );

    const conversation = await this.changeConversation.execute({
      discordChannelId: interaction.channelId!,
      accountId: interaction.user.id,
      model: ChatgptModel.turbo,
    });

    if (conversation._tag === 'Left') {
      return await interaction.editReply(`Error: ${conversation.left.message}`);
    }

    await interaction.editReply(
      `Switched to ${conversation.right.id} using ${conversation.right.model} model.`,
    );
  }

  @Slash({ description: 'Use conversation with smarter model.', name: 'smart' })
  async smart(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const account = await this.accountService.authenticateAccountByDiscordId(
      interaction.user.id,
    );

    const conversation = await this.changeConversation.execute({
      discordChannelId: interaction.channelId!,
      accountId: interaction.user.id,
      model: ChatgptModel.normal,
    });

    if (conversation._tag === 'Left') {
      return await interaction.editReply(`Error: ${conversation.left.message}`);
    }

    await interaction.editReply(
      `Switched to ${conversation.right.id} using ${conversation.right.model} model.`,
    );
  }

  @Slash({ description: 'Use conversation with legacy model.', name: 'legacy' })
  async legacy(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const account = await this.accountService.authenticateAccountByDiscordId(
      interaction.user.id,
    );

    const conversation = await this.changeConversation.execute({
      discordChannelId: interaction.channelId!,
      accountId: interaction.user.id,
      model: ChatgptModel.legacy,
    });

    if (conversation._tag === 'Left') {
      return await interaction.editReply(`Error: ${conversation.left.message}`);
    }

    await interaction.editReply(
      `Switched to ${conversation.right.id} using ${conversation.right.model} model.`,
    );
  }
}
