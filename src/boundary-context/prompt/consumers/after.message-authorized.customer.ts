import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { MessageAuthorizedEvent } from 'src/boundary-context/message/events/message-authorized/message-authorized.event';
import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';

@Injectable()
export class AfterMessageAuthorizedCustomer {
  constructor(
    private prisma: PrismaService,
    private publisher: EventEmitter2,
  ) {}

  @OnEvent('message.authorized')
  async afterMessageAuthorizedCustomer(event: MessageAuthorizedEvent) {
    // TODO: Extract information from message and create Prompt.
    // TODO: Save Prompt in database.
    // TODO: Publish information about creation of Prompt.
  }
}
