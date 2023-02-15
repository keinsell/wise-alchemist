import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";
import { ChatGPTPlusScrapper, ChatgptModel } from "../utils/scrapper.js";
import { kv } from "../utils/kv.js";
import { ChannelType } from "discord.js";
import { ConversationService } from "../module.conversation/conversation.service.js";
import { MessageService } from "../module.message/message.service.js";
import { randomUUID } from "crypto";
import { generateUUID } from "../utils/uuid.js";
import { splitMessage } from "../utils/splitter.js";
import makdownPdf from "markdown-pdf";

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
  private conversationService = new ConversationService();
  private messageService = new MessageService();

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

    // If bot is working, check again every 5 seconds until it is free.
    while (await kv.get("is-working")) {
      await new Promise((resolve) => {
        message.channel.sendTyping();
        setTimeout(resolve, 250);
      });
    }

    // Start typing.
    const typingInterval = setInterval(() => {
      message.channel.sendTyping();
    }, 1000);

    // Find conversation or assigin undefined to conversation
    let conversationId;

    if (!conversationId) {
      // Create conversation
      const conversation =
        await this.conversationService.findLatestConversationByChannel(
          message.channel.id
        );

      if (conversation) {
        conversationId = conversation?.id;
      }
    }

    // Find parent message or assign undefined to parent message
    let parentMessageId;

    if (conversationId) {
      // Find previous message
      const previousMessage =
        await this.conversationService.findLatestMessageInConversation(
          conversationId
        );

      parentMessageId = previousMessage?.id || generateUUID();
    }

    // Create message content from the discord message
    const ai_message = await this.messageService.send({
      prompt: message.content,
      discord_MessageId: message.id,
      discord_ChannelId: message.channel.id,
      discord_UserId: message.author.id,
      parentMessageId: parentMessageId,
      conversationId: conversationId,
    });

    if (!ai_message) {
      await message.channel.send(
        "I'm just an useless bot who sometimes like to knock your fucking server to the hell! :) (Love ya)"
      );
      return;
    }

    // Stop typing.
    clearInterval(typingInterval);

    if (ai_message.output.length > 2000) {
      const pdf = await makdownPdf().from.string(ai_message.output).to.buffer();
      await message.channel.send({ files: [{ attachment: pdf }] });
      return;
    }

    const parts = splitMessage(ai_message.output);

    for await (const part of parts) {
      await message.channel.send(part);
    }
  }
}
