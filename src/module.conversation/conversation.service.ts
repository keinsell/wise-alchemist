import { prisma } from "../infra.prisma/prisma.infra.js";
import { LlmService } from "../module.llm/llm.service.js";

export class ConversationService {
  async findLatestConversationByChannel(channelId: string) {
    const conversation = await prisma.conversation.findMany({
      where: { channelId, isClosed: false },
      take: 1,
      orderBy: { timestamp: "desc" },
    });

    return conversation[0];
  }

  async findLatestMessageInConversation(conversationId: string) {
    const message = await prisma.message.findMany({
      where: { conversationId },
      take: 1,
      orderBy: { timestamp: "desc" },
    });

    return message[0];
  }

  async closeConversationByChannel(channelId: string) {
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
