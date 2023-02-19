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
    description:
      "Activate the Wise Alchemist to share words of wisdom and offer insights on a variety of topics. Whether you're seeking guidance, inspiration, or just a friendly ear, the wise man is here to listen and help. Simply use this command to summon the Wise Alchemist to the channel, and he will be happy to respond to your messages. Please note that the wise man is a bot, and his responses are generated based on programmed responses. While he may not always have the perfect answer, he will do his best to offer helpful and thought-provoking responses.",
    name: "join",
  })
  async stay(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    await keyv.set(`watch-${interaction.channelId}`, ms("10m"));

    interaction.editReply(
      `Welcome, my dear friend, to this place of wonder and mystery. This land is steeped in history and knowledge, and I am honored to share it with you. The secrets of the world are all around us, waiting to be discovered and explored. But do not be fooled by their simplicity, for they hold the key to great wisdom and understanding. Take time to ponder and reflect, for it is in the quiet moments that we can hear the voice of the universe. Embrace the challenges that lie ahead, and let your heart and mind guide you to greatness. May your journey be blessed with joy and fulfillment, and may you find the answers you seek.`
    );
  }

  @Slash({
    description:
      "If you need to pause the responses from the wise alchemist, this command is for you. Simply use it to temporarily deactivate the bot from responding to messages in the channel. Whether you need a break from the conversation or just want to focus on other things, the wise alchemist will respect your wishes and stop responding until you reactivate him. When you're ready to resume the conversation, use the activation command to bring the wise alchemist back to the channel. Please note that the wise alchemist is a bot, and his responses are generated based on programmed responses. While he may not always have the perfect answer, he will do his best to offer helpful and thought-provoking responses.",
    name: "exit",
  })
  async out(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    await keyv.set(`watch-${interaction.channelId}`, false);

    interaction.editReply(
      `Farewell, my dear friends, and may this place continue to inspire and uplift you. Remember that life is a journey, filled with many twists and turns, but always leading us forward. Cherish the memories you have made here, and carry them with you always. As you venture forth into the world, I urge you to remain curious and open-minded, for there is always something new to learn and discover. May your hearts be filled with love, your minds with wisdom, and your souls with peace. Farewell, my dear friends, and may the universe bless and guide you on your journey.`
    );
  }
}
