import { Message } from '@prisma/client';
import { DomainEvent } from 'src/shared/domain-event';

export interface MessageAuthorizedPayload {
  message: Message;
}

export class MessageAuthorizedEvent extends DomainEvent<MessageAuthorizedPayload> {
  constructor(payload: MessageAuthorizedPayload) {
    super(payload);
  }
}
