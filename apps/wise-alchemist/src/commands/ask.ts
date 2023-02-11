import type { CommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { ChatGPTPlusScrapper } from "chatgpt-plus-scrapper";

// Let's start the bot
if (!process.env.CHATGPT_AUTH_TOKEN || !process.env.CHATGPT_COOKIES) {
  throw Error("Could not find BOT_TOKEN in your environment");
}

const scrapper = new ChatGPTPlusScrapper(
  "text-davinci-002-render-paid",
  process.env.CHATGPT_AUTH_TOKEN,
  process.env.CHATGPT_COOKIES
);

@Discord()
export class Asking {
  @Slash({ description: "Ask something that you want to know...", name: "ask" })
  async say(
    @SlashOption({
      description: "Ask something that you want to know...",
      name: "ask",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    text: string,
    interaction: CommandInteraction
  ): Promise<void> {
    console.log(`Catched message: ${text}`);

    const response = await scrapper.request(text);

    if (!response) {
      interaction.reply("Something went wrong.");
      return;
    }

    console.log(`Received response: ${response.message.content.parts[0]}`);

    interaction.reply(response.message.content.parts[0]);
  }
}
