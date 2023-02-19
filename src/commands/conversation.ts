import type { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashChoice } from "discordx";
import { closeConversationByChannel } from "../conversations.js";
import { ChatgptModel } from "../llm.js";

@Discord()
export class Conversation {
  @Slash({
    description: "Manipulate conversation",
    name: "close",
  })
  async close(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    await closeConversationByChannel(interaction.channelId);

    await interaction.deleteReply();
  }

  @Slash({
    description: "Change a preffered model",
    name: "model",
  })
  async model(
    @SlashChoice(ChatgptModel.normal, ChatgptModel.turbo)
    model: ChatgptModel,
    interaction: CommandInteraction
  ): Promise<void> {
    await interaction.deferReply();

    // Find latest conversation on selected channel
    // await this.conversationService.closeConversationByChannel(
    //   interaction.channelId
    // );

    interaction.ephemeral = true;
    interaction.editReply(`Changed model to: ${model}`);
  }
}
