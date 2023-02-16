import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";
import { ChatGPTPlusScrapper, ChatgptModel } from "../utils/scrapper.js";
import { kv } from "../utils/kv.js";
import { ChannelType, Message } from "discord.js";
import { ConversationService } from "../module.conversation/conversation.service.js";
import { MessageService } from "../module.message/message.service.js";
import { generateUUID } from "../utils/uuid.js";
import { splitMessage } from "../utils/splitter.js";

@Discord()
export class OnMessageSent {
  private conversationService = new ConversationService();
  private messageService = new MessageService();

  @On({ event: "messageCreate" })
  async messageCreate(
    [message]: ArgsOf<"messageCreate">,
    client: Client
  ): Promise<void> {
    // If message is made by bot, do not proceed further
    if (message.author.bot) return;
    // Check if message in on allowed "random" channel.
    if (message.channel.id !== "1074137070395740250") return;

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
      await message.reply(
        "I'm just an useless bot who sometimes like to knock your fucking server to the hell! :) (Love ya)"
      );
      clearInterval(typingInterval);
      return;
    }

    // Stop typing.
    clearInterval(typingInterval);

    const parts = splitMessage(ai_message.output);

    for await (const part of parts) {
      const sentMessage = await message.reply(part);
      await this.messageService.linkBotMessageToMessage(
        ai_message,
        sentMessage.id
      );
    }
  }
}
