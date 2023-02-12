import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";
import { ChatGPTPlusScrapper } from "../utils/scrapper.js";
import { kv } from "../utils/kv.js";

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
      await kv.get("model"),
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

    // Set bot as free to chat again.
    await kv.set("is-working", false);

    // Save conversation id for next message.
    await kv.set("conversation-id", response?.conversation_id);

    // Set current message as parent message.
    await kv.set("parent-message", response?.message.id);

    // Stop typing.
    clearInterval(typingInterval);

    // Send response to the discord channel.
    message.reply({
      content: response?.message.content.parts[0]!,
    });
  }
}
