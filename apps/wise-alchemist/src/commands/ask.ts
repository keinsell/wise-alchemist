import type { CommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

@Discord()
export class Asking {
  @Slash({ description: "Ask something that you want to know...", name: "ask" })
  say(
    @SlashOption({
      description: "Ask something that you want to know...",
      name: "ask",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    text: string,
    interaction: CommandInteraction
  ): void {
    interaction.reply(text);
  }
}
