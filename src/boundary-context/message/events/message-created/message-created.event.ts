import { Message } from '@prisma/client';
import { DomainEvent } from 'src/shared/domain-event';

export interface MessageCreatedPayload {
  message: Message;
}

export class MessageCreatedEvent extends DomainEvent<MessageCreatedPayload> {
  constructor(payload: MessageCreatedPayload) {
    super(payload);
  }
}
