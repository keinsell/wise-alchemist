import { Injectable } from '@nestjs/common';
import { Account, Conversation } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';

@Injectable()
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

  public async findOrCreateConversationByDiscordChannelId(
    account: Account,
    channel_id: string,
  ): Promise<Conversation> {
    const existingConversation = await this.prisma.conversation.findFirst({
      where: { account: { id: account.id }, external_id: channel_id },
    });

    if (!existingConversation) {
      // Create conversation
      return this.startConversation(account, channel_id);
    }

    return existingConversation;
  }
}
