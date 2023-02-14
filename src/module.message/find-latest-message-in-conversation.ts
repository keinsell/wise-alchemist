import { prisma } from "../infra.prisma/prisma.infra.js";

export async function findLatestMessageInConversation(conversationId: string) {
  const result = await prisma.message.findMany({
    where: { conversation: { id: conversationId } },
    take: 1,
    orderBy: { timestamp: "desc" },
  });

  return result[0];
}
