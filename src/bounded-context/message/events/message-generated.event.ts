import { DomainEvent } from "../../../shared/domain/events/domain-event.shared.js";

interface Payload {
  messageId: any;
  content: string;
  tokensUsed: number;
}

export class MessageGeneratedEvent extends DomainEvent<Payload> {
  constructor(payload: Payload) {
    super("message-generated", payload);
  }
}
