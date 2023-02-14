import type { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { ConversationService } from "../module.conversation/conversation.service.js";

@Discord()
export class Conversation {
  @Slash({
    description: "Manipulate conversation",
    name: "close",
  })
  async close(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    const closed = await new ConversationService().closeConversationByChannel(
      interaction.channelId
    );

    if (!closed) {
      interaction.editReply(`Conversation not found in current context`);
    } else {
      await interaction.editReply(
        `Conversation ${closed.id} closed successfully.`
      );
    }
  }
}
