import { Account, Conversation } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';

export class ConversationService {
  constructor(private prisma: PrismaService) {}
  public async startConversation(
    account: Account,
    model: string,
  ): Promise<Conversation> {
    return this.prisma.conversation.create({
      data: {
        account: { connect: { id: account.id } },
        model: model,
      },
    });
  }

  public async linkConversationToExternalResource(
    conversation: Conversation,
    resource_id: string,
  ): Promise<Conversation> {
    return this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { external_id: resource_id },
    });
  }
}
