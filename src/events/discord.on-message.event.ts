import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";
import { ChannelType } from "discord.js";
import { findLatestConversationByChannel } from "../conversations.js";
import {
  addDiscordMessageAsPromptToQueue,
  findLatestMessageInConversation,
} from "../messages.js";
import { keyv } from "../infrastructure/keyv.infra.js";

@Discord()
export class OnMessage {
  @On({ event: "messageCreate" })
  async messageCreate(
    [message]: ArgsOf<"messageCreate">,
    client: Client
  ): Promise<void> {
    // Access Control Event
    // Build specification for handling event.
    const isNotMentionedOnChannel = !message.mentions.has(client.user!.id);
    const isMessageSentByBot = message.author.bot;
    const isDirectMessage = message.channel.type === ChannelType.DM;
    const isWatchedChannel = (await keyv.get(
      "watch-" + message.channelId
    )) as boolean;

    if (isMessageSentByBot) {
      return;
    }

    if (isNotMentionedOnChannel) {
      if (!isDirectMessage) {
        if (!isWatchedChannel) {
          return;
        }
      }
    }

    // Prepare Application Content
    // Remove uncesessary mention tag.
    message.content = message.content
      .replace(new RegExp(`<@!?${client.user!.id}>`, "gi"), "")
      .trim();

    // If message contain attached txt file, read information from file and append to message content
    if (
      message.attachments.some((attachment) =>
        attachment.name?.endsWith(".txt")
      )
    ) {
      message.content += "\n";
      for (const attachment of message.attachments) {
        const file = await fetch(attachment[1].url).then((response) =>
          response.arrayBuffer()
        );
        const decoder = new TextDecoder();
        const contentx = decoder.decode(file);
        message.content += "\n\n" + contentx;
      }
    }

    await addDiscordMessageAsPromptToQueue(message);
  }
}
