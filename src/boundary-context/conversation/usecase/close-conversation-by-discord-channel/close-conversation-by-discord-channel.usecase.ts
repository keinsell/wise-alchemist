import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Conversation } from '@prisma/client';
import { Either } from 'fp-ts/lib/Either';
import { ChatgptModel } from 'src/boundary-context/completion/providers/content-generation/chatgpt/chatgpt.model';
import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';
import { Exception } from 'src/shared/domain-error';
import { Usecase } from 'src/shared/domain-usecase';
import { ConversationStartedEvent } from '../../events/conversation-started/conversation-started.event';

interface CloseConversationByDiscordChannelPayload {
  channelId: string;
  accountId: string;
}

@Injectable()
export class CloseConversationByDiscordChannelUsecase extends Usecase<
  CloseConversationByDiscordChannelPayload,
  Conversation
> {
  constructor(private prisma: PrismaService, private publisher: EventEmitter2) {
    super();
  }

  async execute(
    request: CloseConversationByDiscordChannelPayload,
  ): Promise<Either<Exception, Conversation>> {
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

    const convers = await this.prisma.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        isArchived: true,
      },
    });

    return this.success(convers);
  }
}
