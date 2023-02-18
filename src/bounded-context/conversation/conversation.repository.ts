import { injectable } from "tsyringe";
import { PrismaService } from "../../infrastructure/prisma/prisma.infra.js";
import { Conversation } from "@prisma/client";

@injectable()
export class ConversationRepsotitory {
  constructor(private readonly prisma: PrismaService) {}
  async findLatestConversationByChannelId(
    channelId: string
  ): Promise<Conversation | undefined> {
    const conversation = await this.prisma.conversation.findFirst({
      where: { channelId, isClosed: false },
      orderBy: { timestamp: "desc" },
    });

    return conversation || undefined;
  }

  async findConversationByUniqueId(
    uniqueId: string
  ): Promise<Conversation | undefined> {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: uniqueId },
    });
    return conversation || undefined;
  }
}
