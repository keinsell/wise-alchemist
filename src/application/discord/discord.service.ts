import {
  Injectable,
  OnModuleInit,
  INestApplication,
  Logger,
} from '@nestjs/common';
import { IntentsBitField, Interaction, Message, Partials } from 'discord.js';
import { Client, ILogger } from 'discordx';
import { DiscordOnMessageEvent } from './events/discord.on-message.event';

export class DiscordxLogger implements ILogger {
  private logger = new Logger('discordx');
  error(...args: unknown[]): void {
    this.logger.verbose({
      ...args,
    });
  }
  info(...args: unknown[]): void {
    this.logger.verbose({
      ...args,
    });
  }
  log(...args: unknown[]): void {
    this.logger.verbose({
      ...args,
    });
  }
  warn(...args: unknown[]): void {
    this.logger.verbose({
      ...args,
    });
  }
}

@Injectable()
export class DiscordService extends Client implements OnModuleInit {
  private readonly _logger = new Logger(DiscordService.name);
  constructor(private onMessageCreateEvent: DiscordOnMessageEvent) {
    super({
      logger: new DiscordxLogger(),
      intents: [
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.DirectMessageTyping,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.DirectMessageReactions,
        IntentsBitField.Flags.GuildMessageTyping,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.Guilds,
      ],

      partials: [Partials.Channel, Partials.Message, Partials.Reaction],

      silent: true,

      // Configuration for @SimpleCommand
      simpleCommand: {
        prefix: '!',
      },
    });
  }

  async onModuleInit() {
    this.on('ready', async () => {
      // Make sure all guilds are cached
      await this.guilds.fetch();

      // Synchronize applications commands with Discord
      await this.initApplicationCommands();

      // To clear all guild commands, uncomment this line,
      // This is useful when moving from guild commands to global commands
      // It must only be executed once
      //
      await this.clearApplicationCommands(
        ...this.guilds.cache.map((g) => g.id),
      );
      this._logger.log('Successfully started Discord Application!');
    });

    this.on('interactionCreate', async (interaction: Interaction) => {
      this.executeInteraction(interaction);
    });

    this.on('messageCreate', async (message: Message) => {
      this.executeCommand(message);
      this.onMessageCreateEvent.messageCreate([message], this);
    });

    await this.login(process.env.BOT_TOKEN);
  }

  async enableShutdownHooks(app: INestApplication) {}
}
