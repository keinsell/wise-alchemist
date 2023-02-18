import { DomainEvent } from "../../../shared/domain/events/domain-event.shared.js";

interface PromptCreatedPayload {
  id: number | string | any;
  content: string;
  parentMessageId?: string;
  conversationId?: string;
}

export class PromptCreatedEvent extends DomainEvent<PromptCreatedPayload> {
  constructor(payload: PromptCreatedPayload) {
    super("prompt-created", payload);
  }
}
