import { DomainEvent } from 'src/shared/domain-event';

export interface ConversationStartedPayload {
  conversationId: string;
}

export class ConversationStartedEvent extends DomainEvent<ConversationStartedPayload> {
  constructor(payload: ConversationStartedPayload) {
    super(payload);
  }
}
