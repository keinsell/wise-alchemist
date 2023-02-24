import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Conversation } from '@prisma/client';
import { Either } from 'fp-ts/lib/Either';
import { ChatgptModel } from 'src/boundary-context/completion/providers/content-generation/chatgpt/chatgpt.model';
import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';
import { Exception } from 'src/shared/domain-error';
import { Usecase } from 'src/shared/domain-usecase';
import { ConversationStartedEvent } from '../../events/conversation-started/conversation-started.event';

interface OpenConversationByDiscordChannelPayload {
  model?: string;
  channelId: string;
  accountId: string;
}

@Injectable()
export class OpenConversationByDiscordChannelUsecase extends Usecase<
  OpenConversationByDiscordChannelPayload,
  Conversation
> {
  constructor(private prisma: PrismaService, private publisher: EventEmitter2) {
    super();
  }

  async execute(
    request: OpenConversationByDiscordChannelPayload,
  ): Promise<Either<Exception, Conversation>> {
    // Create a new conversation,
    const conversation = await this.prisma.conversation.create({
      data: {
        model: request.model ?? ChatgptModel.turbo,
        discord_channel_id: request.channelId,
        account: {
          connect: {
            id: request.accountId,
          },
        },
      },
    });

    this.publisher.emit(
      'conversation.started',
      new ConversationStartedEvent({
        conversationId: conversation.id,
      }),
    );

    return this.success(conversation);
  }
}
