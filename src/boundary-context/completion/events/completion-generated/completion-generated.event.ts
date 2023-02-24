import { Completion, Conversation, Message, Prompt } from '@prisma/client';
import { DomainEvent } from 'src/shared/domain-event';

export interface CompletionGeneratedPayload {
  createdByPrompt: Prompt;
  promptCreatedByMessage: Message;
  messageFromConversation: Conversation;
  generationMade: Completion;
}

export class CompletionGeneratedEvent extends DomainEvent<CompletionGeneratedPayload> {
  constructor(payload: CompletionGeneratedPayload) {
    super(payload);
  }
}
