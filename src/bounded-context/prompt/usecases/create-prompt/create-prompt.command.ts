import { Command } from "../../../../shared/domain/command.shared.js";

export class CreatePromptCommand extends Command<{
  accountId: string;
  messageId: string;
  channelId: string;
  content: string;
  parentMessageId?: string;
  conversationId?: string;
}> {}
