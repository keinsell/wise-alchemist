import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Conversation } from '@prisma/client';
import { Either } from 'fp-ts/lib/Either';
import { ChatgptModel } from 'src/boundary-context/completion/providers/content-generation/chatgpt/chatgpt.model';
import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';
import { Exception } from 'src/shared/domain-error';
import { Usecase } from 'src/shared/domain-usecase';
import { ConversationStartedEvent } from '../../events/conversation-started/conversation-started.event';
import { CloseConversationByDiscordChannelResponse } from './close-conversation-by-discord-channel.response';

interface CloseConversationByDiscordChannelPayload {
  channelId: string;
  accountId: string;
}

@Injectable()
export class CloseConversationByDiscordChannelUsecase extends Usecase<
  CloseConversationByDiscordChannelPayload,
  CloseConversationByDiscordChannelResponse
> {
  constructor(private prisma: PrismaService, private publisher: EventEmitter2) {
    super();
  }

  async execute(
    request: CloseConversationByDiscordChannelPayload,
  ): Promise<Either<Exception, CloseConversationByDiscordChannelResponse>> {
    // Find latest open conversation, on channel
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        discord_channel_id: request.channelId,
        isArchived: false,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    if (!conversation) {
      return this.fail(
        new Exception('Conversation not found', 'conversation.not-found'),
      );
    }

    const closedConversation = await this.prisma.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        isArchived: true,
      },
    });

    const messageCount = await this.prisma.message.count({
      where: {
        conversation_id: conversation.id,
      },
    });

    // Execute Raw Query to Count Tokens in Conversation
    const tokensCount = await this.prisma.$queryRaw<[{ sum: number | null }]>`
      SELECT SUM("Message"."tokenCount")
      FROM "Message"
      WHERE "Message"."conversation_id" = '${conversation.id}'
      `;

    console.log(tokensCount);

    return this.success({
      id: closedConversation.id,
      messagesCount: messageCount,
      tokensCount: tokensCount[0].sum ?? 0,
    });
  }
}
