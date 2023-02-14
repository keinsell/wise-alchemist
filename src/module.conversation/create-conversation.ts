import { prisma } from "../infra.prisma/prisma.infra.js";

export async function createConversation(properties: {
  id?: string;
  discordChannelId: string;
}) {
  if (properties.id) {
    // Find one if not create and return
    const converation = await prisma.conversation.findUnique({
      where: {
        id: properties.id,
      },
    });

    if (converation != null) {
      return converation;
    }
  }

  const converation = await prisma.conversation.create({
    data: {
      id: properties.id,
      channelId: properties.discordChannelId,
    },
  });

  return converation;
}
