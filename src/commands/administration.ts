import type { CommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { ChatGPTPlusScrapper } from "../utils/scrapper.js";
import { prisma } from "../infra.prisma/prisma.infra.js";

// Let's start the bot
if (!process.env.CHATGPT_AUTH_TOKEN || !process.env.CHATGPT_COOKIES) {
  throw Error("Could not find BOT_TOKEN in your environment");
}

// @Discord()
// export class Hard {
//   @Slash({ description: "Ask something that you want to know...", name: "hard" })
//   async say(
//     @SlashOption({
//       description: "Ask something that you want to know...",
//       name: "ask",
//       required: true,
//       type: ApplicationCommandOptionType.String,
//     })
//     text: string,
//     interaction: CommandInteraction
//   ): Promise<void> {
//     console.log(`Catched message: ${text}`);

//     // interaction.deferReply();

//     await prisma.message.deleteMany();
//     await prisma.conversation.deleteMany();

//     // console.log(`Received response: ${response.message.content.parts[0]}`);

//     // interaction.editReply(response.message.content.parts[0]);
//   }
// }
