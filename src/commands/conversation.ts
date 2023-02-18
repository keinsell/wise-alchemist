import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { ConversationService } from "../module.conversation/conversation.service.js";
import { ChatgptModel, ChatgptModelType } from "../utils/scrapper.js";
import { kv } from "../utils/kv.js";

@Discord()
export class Conversation {
  private conversationService = new ConversationService();
  @Slash({
    description: "Manipulate conversation",
    name: "close",
  })
  async close(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    await new ConversationService().closeConversationByChannel(
      interaction.channelId
    );

    await interaction.deleteReply();
  }

  @Slash({
    description: "Change a preffered model",
    name: "model",
  })
  async model(
    @SlashOption({
      description: "Model to use",
      name: "model",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    @SlashChoice(...Object.values(ChatgptModel))
    model: ChatgptModelType,
    interaction: CommandInteraction
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    // Find latest conversation on selected channel
    // await this.conversationService.closeConversationByChannel(
    //   interaction.channelId
    // );

    await kv.set("model", model);

    interaction.editReply(`Changed model to: ${model}`);
  }
}
