import type { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { ConversationService } from "../module.conversation/conversation.service.js";

@Discord()
export class Conversation {
  @Slash({
    description: "Manipulate conversation",
    name: "conversation",
  })
  async close(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    await new ConversationService().closeConversationByChannel(
      interaction.channelId
    );

    await interaction.deleteReply();
  }
}
