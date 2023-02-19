import { Conversation, Message } from "@prisma/client";
import { prisma } from "./infrastructure/prisma.infra.js";

/**
 * Finds the latest conversation associated with the given channel ID.
 * @param {string} channelId - The ID of the channel to find the conversation for.
 * @returns {Promise<Conversation>} - The latest conversation object in the channel, or null if not found.
 */
export async function findLatestConversationByChannel(
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
 * Closes the latest conversation associated with the given channel ID.
 * @param {string} channelId - The ID of the channel to close the conversation for.
 * @returns {Promise<void>} - Resolves once the conversation has been closed, or does nothing if no conversation is found.
 */
export async function closeConversationByChannel(
  channelId: string
): Promise<void> {
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
