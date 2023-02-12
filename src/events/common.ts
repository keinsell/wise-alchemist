import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";
import { ChatGPTPlusScrapper, ChatgptModel } from "../utils/scrapper.js";
import { kv } from "../utils/kv.js";
import { ChannelType } from "discord.js";

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

    console.log(
      `Received message from ${message.author.username}: ${message.content}`
    );

    // Check if message in on allowed "random" channel.
    if (message.channel.id !== "1074137070395740250") return;

    if (message.channel.type === ChannelType.DM) {
      console.log(
        `Received DM from ${message.author.username}: ${message.content}`
      );
      // Allow only for users in provided ids.
      const users = ["906181062479204352", "507954887502594058"];

      if (!users.includes(message.author.id)) return;

      await kv.set("model", ChatgptModel.normal);
    } else {
      await kv.set("model", ChatgptModel.turbo);
    }

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

    // If message was sent in DMs, send the response to the user who sent the message.
    if (message.channel.type === ChannelType.DM) {
      message.channel.send({
        content: response?.message.content.parts[0]!,
      });
      return;
    }

    // Send response to the discord channel.
    message.reply({
      content: response?.message.content.parts[0]!,
    });
  }
}
