import { Message, Prompt } from '@prisma/client';
import { DomainEvent } from 'src/shared/domain-event';

export interface PromptCreatedPayload {
  prompt: Prompt;
  message: Message;
}

export class PromptCreatedEvent extends DomainEvent<PromptCreatedPayload> {
  constructor(payload: PromptCreatedPayload) {
    super(payload);
  }
}
