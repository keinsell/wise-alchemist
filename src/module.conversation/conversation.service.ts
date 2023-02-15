import { Conversation, Message } from "@prisma/client";
import { prisma } from "../infra.prisma/prisma.infra.js";
import { LlmService } from "../module.llm/llm.service.js";

export class ConversationService {
  /**
   * Finds the latest conversation associated with the given channel ID.
   * @param {string} channelId - The ID of the channel to find the conversation for.
   * @returns {Promise<Conversation>} - The latest conversation object in the channel, or null if not found.
   */
  async findLatestConversationByChannel(
    channelId: string
  ): Promise<Conversation> {
    const conversation = await prisma.conversation.findMany({
      where: { channelId, isClosed: false },
      take: 1,
      orderBy: { timestamp: "desc" },
    });

    return conversation[0];
  }

  /**
   * Finds the latest message associated with the given conversation ID.
   * @param {string} conversationId - The ID of the conversation to find the message for.
   * @returns {Promise<Message>} - The latest message object in the conversation, or null if not found.
   */
  async findLatestMessageInConversation(
    conversationId: string
  ): Promise<Message> {
    const message = await prisma.message.findMany({
      where: { conversationId },
      take: 1,
      orderBy: { timestamp: "desc" },
    });

    return message[0];
  }

  /**
   * Closes the latest conversation associated with the given channel ID.
   * @param {string} channelId - The ID of the channel to close the conversation for.
   * @returns {Promise<void>} - Resolves once the conversation has been closed, or does nothing if no conversation is found.
   */
  async closeConversationByChannel(channelId: string): Promise<void> {
    const latest = await this.findLatestConversationByChannel(channelId);

    if (!latest) return;

    await prisma.conversation.update({
      where: {
        id: latest.id,
      },
      data: {
        isClosed: true,
      },
    });
  }
}
