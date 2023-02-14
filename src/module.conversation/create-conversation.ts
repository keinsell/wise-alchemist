import { prisma } from "../infra.prisma/prisma.infra.js";

export async function createConversation(properties: {
  id?: string;
  discordChannelId: string;
}) {
  const converation = await prisma.conversation.create({
    data: {
      id: properties.id,
      channelId: properties.discordChannelId,
    },
  });

  return converation;
}
