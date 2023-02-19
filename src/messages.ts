import { Message } from "@prisma/client";
import { Message as DiscordMessage } from "discord.js";
import { prisma } from "./infrastructure/prisma.infra.js";
import { llmQueue } from "./llm.worker.js";
import { findLatestConversationByChannel } from "./conversations.js";
import signale from "signale";

/**
 * Finds the latest message associated with the given conversation ID.
 * @param {string} conversationId - The ID of the conversation to find the message for.
 * @returns {Promise<Message>} - The latest message object in the conversation, or null if not found.
 */
export async function findLatestMessageInConversation(
  conversationId: string
): Promise<Message> {
  const message = await prisma.message.findMany({
    where: { conversationId },
    take: 1,
    orderBy: { timestamp: "desc" },
  });

  return message[0];
}

export async function addDiscordMessageAsPromptToQueue(
  message: DiscordMessage
): Promise<void> {
  // Find conversation and parent message related to conversation
  let conversationId: string | undefined = undefined;
  let parentMessageId: string | undefined = undefined;

  const conversation = await findLatestConversationByChannel(message.channelId);

  if (conversation) {
    conversationId = conversation.id;

    const latestMessage = await findLatestMessageInConversation(conversationId);

    if (latestMessage) {
      parentMessageId = latestMessage.id;
    }
  }

  console.log("conversation: ", conversationId);
  console.log("latestmessage: ", parentMessageId);

  await llmQueue.add({
    messageContent: message.content,
    discordChannelId: message.channelId,
    discordMessageId: message.id,
    discordUserId: message.author.id,
    parentMessageId: parentMessageId,
    conversationId: conversationId,
  });

  signale.info(`Message ${message.id} added to queue.`);
}
