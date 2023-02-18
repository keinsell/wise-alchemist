import { Command } from "../../../../shared/domain/command.shared.js";

export class GetAccountByDiscordCommand extends Command<{
  discordUserId: string;
}> {}
