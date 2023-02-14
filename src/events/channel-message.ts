import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";
import { ChatGPTPlusScrapper, ChatgptModel } from "../utils/scrapper.js";
import { kv } from "../utils/kv.js";
import { ChannelType, Message } from "discord.js";

const mainscrapper = new ChatGPTPlusScrapper(
  await kv.get("model"),
  await kv.get("auth-token"),
  await kv.get("cookies")
);

await kv.set("is-working", false);
await kv.set("parent-message", mainscrapper.createUUID());
await kv.set("conversation-id", undefined);

@Discord()
export class OnMessageSent {
  @On({ event: "messageCreate" })
  async messageCreate(
    [message]: ArgsOf<"messageCreate">,
    client: Client
  ): Promise<void> {
    // If message is made by bot, do not proceed further
    if (message.author.bot) return;
    // Check if message in on allowed "random" channel.
    if (message.channel.id !== "1074137070395740250") return;

    // Proceed with chatting with users as GPT.
    const scrapper = new ChatGPTPlusScrapper(
      ChatgptModel.turbo,
      await kv.get("auth-token"),
      await kv.get("cookies")
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

    // Create message content from the discord message
    const response = await scrapper.request(
      message.content,
      await kv.get("parent-message"),
      await kv.get("conversation-id")
    );

    if (!response) return;

    // Set bot as free to chat again.
    await kv.set("is-working", false);

    // Save conversation id for next message.
    await kv.set("conversation-id", response?.conversation_id);

    // Set current message as parent message.
    await kv.set("parent-message", response?.message.id);

    // Stop typing.
    clearInterval(typingInterval);

    // Loop over each response and send it
    for (const part of response?.message.content.parts[0].split("\n")) {
      if (part === "") continue;

      // If paragraph is longer than 2000 characters, split it into multiple paragraphs and send those
      if (part.length > 2000) {
        const remaining = part.length;
        let previousMessageId = undefined;

        for (let i = 0; i < remaining; i = i + 1000) {
          const toSend = part.substring(i, i + 1000);
          const sentMessage: Message = await message.channel.send({
            content: toSend,
            // If this is first message, set parent message.
            // If this is not first message, set parent message to previous message id.
            reply: previousMessageId
              ? { messageReference: previousMessageId }
              : undefined,
          });

          previousMessageId = sentMessage.id;
        }

        continue;
      }

      // Send response to the discord channel.
      message.reply({
        content: part,
      });
    }
  }
}
