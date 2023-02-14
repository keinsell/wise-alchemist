import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";
import { ChatGPTPlusScrapper, ChatgptModel } from "../utils/scrapper.js";
import { kv } from "../utils/kv.js";
import { ChannelType } from "discord.js";
import { createMessage } from "../module.message/create-message.js";
import { findLatestConversationInChannel } from "../module.conversation/find-latest-conversation-in-channel.js";

const mainscrapper = new ChatGPTPlusScrapper(
  await kv.get("model"),
  await kv.get("auth-token"),
  await kv.get("cookies")
);

await kv.set("is-working", false);
await kv.set("parent-message", mainscrapper.createUUID());
await kv.set("conversation-id", undefined);

@Discord()
export class OnDMMessageSent {
  @On({ event: "messageCreate" })
  async messageCreate(
    [message]: ArgsOf<"messageCreate">,
    client: Client
  ): Promise<void> {
    // If message is made by bot, do not proceed further
    if (message.author.bot) return;
    if (message.channel.type !== ChannelType.DM) return;

    const users = [
      "906181062479204352",
      "507954887502594058",
      "596412668265627660",
    ];

    if (!users.includes(message.author.id)) return;

    console.log(
      `Received message from ${message.author.username}: ${message.content}`
    );

    // If bot is working, check again every 5 seconds until it is free.
    while (await kv.get("is-working")) {
      await new Promise((resolve) => {
        message.channel.sendTyping();
        setTimeout(resolve, 500);
      });
    }

    // Set bot as working.
    await kv.set("is-working", true);

    // Start typing.
    const typingInterval = setInterval(() => {
      message.channel.sendTyping();
    }, 1000);

    // Const find previous conversation
    const conversation = await findLatestConversationInChannel(
      message.channel.id
    );

    // Create message content from the discord message
    const ai_message = await createMessage({
      fromDiscordUserId: message.author.id,
      fromDiscordMessageId: message.id,
      fromDiscordChannelId: message.channel.id,
      messageContent: message.content,
      conversationId: conversation ? conversation.id : undefined,
    });

    if (!ai_message) return;

    // Stop typing.
    clearInterval(typingInterval);

    // Loop over each response and send it
    for (const part of ai_message.output.split("\n")) {
      if (part === "") continue;

      // If paragraph is longer than 2000 characters, split it into multiple paragraphs and send those
      if (part.length > 2000) {
        const remaining = part.length;
        for (let i = 0; i < remaining; i = i + 1000) {
          const toSend = part.substring(i, i + 1000);
          message.channel.send(toSend);
        }
        continue;
      }

      const sentMessage = await message.channel.send(part);
    }
  }
}
