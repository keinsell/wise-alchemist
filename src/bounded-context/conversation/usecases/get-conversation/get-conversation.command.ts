import { Command } from "../../../../shared/domain/command.shared.js";

export class GetConversationCommand extends Command<{
  channelId?: string;
}> {}
