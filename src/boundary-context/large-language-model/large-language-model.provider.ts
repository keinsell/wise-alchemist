import { Conversation, Message } from '@prisma/client';

export type LargeLanguageModelOptions = {
  model?: string;
  conversation?: Conversation;
  latestMessage?: Message;
};

export interface LargeLanguageModelProvider<
  T extends LargeLanguageModelOptions,
> {
  promptMessage(message: string, options?: T): Promise<Message>;
}
