import { DomainEvent } from 'src/shared/domain-event';

export interface MessageAuthorizedPayload {
  messageId: string;
}

export class MessageAuthorizedEvent extends DomainEvent<MessageAuthorizedPayload> {
  constructor(payload: MessageAuthorizedPayload) {
    super(payload);
  }
}
