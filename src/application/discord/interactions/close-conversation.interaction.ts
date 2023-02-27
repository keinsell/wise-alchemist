import { CommandInteraction, CacheType, SlashCommandBuilder } from 'discord.js';
import { DiscordSlashCommand } from '../base/discord.slash-command.port';
import { CloseConversationByDiscordChannelUsecase } from 'src/boundary-context/conversation/usecase/close-conversation-by-discord-channel/close-conversation-by-discord-channel.usecase';

export class CloseConversationDiscordCommand implements DiscordSlashCommand {
  public name: string = 'close';
  public description: string = 'Closes the conversation';
  public command: SlashCommandBuilder;

  constructor(
    private closeConversation: CloseConversationByDiscordChannelUsecase,
  ) {
    this.command = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);
  }

  public async run(interaction: CommandInteraction<CacheType>): Promise<void> {
    await interaction.deferReply({
      ephemeral: true,
    });

    try {
      await this.closeConversation.execute({
        channelId: interaction.channelId,
        accountId: interaction.user.id,
      });
    } catch (error) {
      await interaction.editReply(`${error.message}`);
      return;
    }

    await interaction.editReply(`Conversation closed`);
  }
}
