import { prisma } from "../infra.prisma/prisma.infra.js";

export async function findLatestConversationInChannel(channelId: string) {
  const conversation = await prisma.conversation.findMany({
    where: { channelId },
    take: 1,
    orderBy: { timestamp: "desc" },
  });

  return conversation[0];
}
