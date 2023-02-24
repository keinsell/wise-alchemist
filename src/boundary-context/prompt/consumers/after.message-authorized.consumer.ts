import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { MessageAuthorizedEvent } from 'src/boundary-context/message/events/message-authorized/message-authorized.event';
import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';
import { PromptCreatedEvent } from '../events/prompt-created/prompt-created.event';

@Injectable()
export class AfterMessageAuthorizedCustomer {
  constructor(
    private prisma: PrismaService,
    private publisher: EventEmitter2,
  ) {}

  @OnEvent('message.authorized')
  async afterMessageAuthorizedCustomer(event: MessageAuthorizedEvent) {
    // Find informations to build Prompt.
    const message = await this.prisma.message.findUnique({
      where: {
        id: event.payload.message.id,
      },
      include: {
        conversation: true,
      },
    });

    if (!message) {
      return;
    }

    const model = message.conversation.model;

    // Create prompt from message.

    const prompt = await this.prisma.prompt.create({
      data: {
        message: {
          connect: {
            id: event.payload.message.id,
          },
        },
        model: model,
        prompt: message.content,
      },
    });

    this.publisher.emit(
      'prompt.created',
      new PromptCreatedEvent({
        prompt: prompt,
        message: message,
      }),
    );
  }
}
