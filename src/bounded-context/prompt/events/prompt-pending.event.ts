import { DomainEvent } from "../../../shared/domain/events/domain-event.shared.js";

interface PromptQueuedPayload {
  id: number | string | any;
  content: string;
  parentMessageId?: string;
  conversationId?: string;
}

export class PromptQueuedEvent extends DomainEvent<PromptQueuedPayload> {
  constructor(payload: PromptQueuedPayload) {
    super("prompt-queued", payload);
  }
}
