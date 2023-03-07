import {
  Injectable,
  OnModuleInit,
  INestApplication,
  Logger,
} from '@nestjs/common';
import { IntentsBitField, Interaction, Message, Partials } from 'discord.js';
import { Client, DIService, ILogger } from 'discordx';
import { NestDependencyRegistery } from './infra/nest-dependency-registery';
import { ModuleRef } from '@nestjs/core';
import { importx } from '@discordx/importer';

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
  constructor(private moduleRef: ModuleRef) {
    DIService.engine = new NestDependencyRegistery(moduleRef);

    super({
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

      silent: false,

      // Configuration for @SimpleCommand
      simpleCommand: {
        prefix: '!',
      },
    });
  }

  async onModuleInit() {
    await importx(
      __dirname + '/{listeners,commands}/**/*.{event,command}.{ts,js}',
    );
    this.on('ready', async () => {
      await this.guilds.fetch();

      await this.initApplicationCommands();

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
    });

    await this.login(process.env.BOT_TOKEN);
  }

  async enableShutdownHooks(app: INestApplication) {}
}
