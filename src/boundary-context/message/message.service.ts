import { Account, Conversation, Message } from '@prisma/client';
import { Message as DiscordMessage } from 'discord.js';
import { encode } from 'gpt-3-encoder';
import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';

export class ConversationService {
  constructor(private prisma: PrismaService) {}
  public async createMessageFromDiscord(
    message: DiscordMessage,
    conversation: Conversation,
  ): Promise<Message> {
    const tokens = encode(message.content);
    return this.prisma.message.create({
      data: {
        external_id: message.id,
        author: message.author.id,
        tokenCount: tokens.length,
        tokens: tokens,
        conversation: { connect: { id: conversation.id } },
        content: message.content,
      },
    });
  }
}
