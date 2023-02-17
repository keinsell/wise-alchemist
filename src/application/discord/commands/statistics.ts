import type { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashChoice } from "discordx";
import { ConversationService } from "../../../module.conversation/conversation.service.js";
import { ChatgptModel, ChatgptModelType } from "../../../utils/scrapper.js";
import { kv } from "../../../utils/kv.js";

@Discord()
export class Statistics {
  private conversationService = new ConversationService();

  @Slash({
    description: "View global statistics of bot",
    name: "stats",
  })
  async stats(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const currenlyActiveConversations =
      await this.conversationService.currenlyActiveConversations();

    interaction.editReply(
      `**GPT-J-6B Statistics**\nCurrently active conversations: ${currenlyActiveConversations}`
    );
  }
}
