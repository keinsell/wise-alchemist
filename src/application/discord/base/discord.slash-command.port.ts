import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

export abstract class DiscordSlashCommand {
  public abstract name: string;
  public abstract description: string;
  public abstract command: SlashCommandBuilder;
  public abstract run(interaction: CommandInteraction): Promise<void>;
}
