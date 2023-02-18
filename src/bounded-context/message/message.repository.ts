import { Message } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.infra.js";

export class MessageRepository {
  constructor(private prisma: PrismaService) {}

  async findLatestMessageByConverationId(
    conversationId: string
  ): Promise<Message | undefined> {
    return (
      (await this.prisma.message.findFirst({
        where: { conversationId },
        orderBy: { timestamp: "desc" },
      })) || undefined
    );
  }
}
