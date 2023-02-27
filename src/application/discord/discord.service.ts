import {
  Injectable,
  OnModuleInit,
  INestApplication,
  Logger,
} from '@nestjs/common';
import {
  Collection,
  IntentsBitField,
  Interaction,
  Message,
  Partials,
  REST,
  Routes,
} from 'discord.js';
import { Client, ILogger } from 'discordx';
import { DiscordOnMessageEvent } from './listeners/discord.on-message.listener';
import { DiscordSlashCommand } from './base/discord.slash-command.port';
import { CloseConversationDiscordCommand } from './interactions/close-conversation.interaction';

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
  constructor(
    private onMessageCreateEvent: DiscordOnMessageEvent,
    private closeConversation: CloseConversationDiscordCommand,
  ) {
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
    const commands = new Collection<string, DiscordSlashCommand>();
    commands.set(this.closeConversation.command.name, this.closeConversation);

    this.on('ready', async () => {
      // Make sure all guilds are cached
      await this.guilds.fetch();

      // Synchronize applications commands with Discord
      await this.initApplicationCommands();
      await this.initalizeSlashCommands();

      // To clear all guild commands, uncomment this line,
      // This is useful when moving from guild commands to global commands
      // It must only be executed once
      //
      // await this.clearApplicationCommands(
      //   ...this.guilds.cache.map((g) => g.id),
      // );

      this._logger.log('Successfully started Discord Application!');
    });

    this.on('interactionCreate', async (interaction: Interaction) => {
      this.executeInteraction(interaction);

      // Add slash commands
      if (interaction.isCommand()) {
        const command = commands.get(interaction.commandName);

        this._logger.log(command);
        this._logger.log(interaction);

        try {
          command.run(interaction);
        } catch (error) {
          console.error(error);
        }
      }
    });

    this.on('messageCreate', async (message: Message) => {
      this.executeCommand(message);
      this.onMessageCreateEvent.messageCreate([message], this);
    });

    await this.login(process.env.BOT_TOKEN);
  }

  async enableShutdownHooks(app: INestApplication) {}

  private async initalizeSlashCommands() {
    const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

    try {
      await rest.put(Routes.applicationCommands('1073689033210875964'), {
        body: [this.closeConversation.command.toJSON()],
      });

      this._logger.log('Slash command registered successfully!');
    } catch (error) {
      this._logger.error(error);
    }
  }

  private async clearSlashCommands() {
    const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

    try {
      await rest.put(Routes.applicationCommands('1073689033210875964'), {
        body: [],
      });

      this._logger.log('Slash command removed successfully!');
    } catch (error) {
      this._logger.error(error);
    }
  }
}
