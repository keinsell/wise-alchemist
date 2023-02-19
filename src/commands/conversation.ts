import type { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashChoice } from "discordx";
import { closeConversationByChannel } from "../conversations.js";
import { ChatgptModel } from "../llm.js";
import { keyv } from "../infrastructure/keyv.infra.js";
import ms from "ms";

@Discord()
export class Conversation {
  @Slash({
    description: "Manipulate conversation",
    name: "close",
  })
  async close(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    await closeConversationByChannel(interaction.channelId);

    await interaction.editReply("Conversation has been closed !");
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

  @Slash({
    description: "Come and be active on this channel for a while",
    name: "come",
  })
  async stay(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    await keyv.set(`watch-${interaction.channelId}`, ms("10m"));

    interaction.editReply(`I'll stay`);
  }

  @Slash({
    description: "Exit the conversation and stop replying to every message",
    name: "exit",
  })
  async out(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    await keyv.set(`watch-${interaction.channelId}`, false);

    interaction.editReply(`I'll go`);
  }
}
