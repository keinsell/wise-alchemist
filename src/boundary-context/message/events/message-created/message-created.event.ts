import { Completion, Message } from '@prisma/client';
import { DomainEvent } from 'src/shared/domain-event';

export interface MessageCreatedPayload {
  previousMessageId: string;
  message: Message;
}

export class MessageCreatedEvent extends DomainEvent<MessageCreatedPayload> {
  constructor(payload: MessageCreatedPayload) {
    super(payload);
  }
}
