import { NestFactory } from '@nestjs/core';
import { AppModule } from './infrastructure/app.module.js';
import { dirname, importx, isESM } from '@discordx/importer';
import {
  Client,
  DIService,
  tsyringeDependencyRegistryEngine,
  typeDiDependencyRegistryEngine,
} from 'discordx';
import { Interaction, Message } from 'discord.js';
import { Logger } from '@nestjs/common';
import { NestjsDependencyRegistryEngine } from './infrastructure/discord/discord.dependency-registry-engine.js';

async function bootstrap() {
  const logger = new Logger('main');
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  DIService.engine = NestjsDependencyRegistryEngine.setContainer(app);
  const discord = app.get(Client);

  discord.on('ready', async () => {
    // Make sure all guilds are cached
    await discord.guilds.fetch();

    // Synchronize applications commands with Discord
    await discord.initApplicationCommands();

    // To clear all guild commands, uncomment this line,
    // This is useful when moving from guild commands to global commands
    // It must only be executed once
    //
    await discord.clearApplicationCommands(
      ...discord.guilds.cache.map((g) => g.id),
    );

    logger.log('Wise alchemist has woken!');
  });

  discord.on('interactionCreate', (interaction: Interaction) => {
    discord.executeInteraction(interaction);
  });

  discord.on('messageCreate', async (message: Message) => {
    discord.executeCommand(message);
  });

  importx(`${__dirname}/application/discord/events/**.js`);
  importx(`${__dirname}/application/discord/commands/**.js`);

  // Let's start the bot
  if (!process.env.BOT_TOKEN) {
    throw Error('Could not find BOT_TOKEN in your environment');
  }

  // Log in with your bot token
  await discord.login(process.env.BOT_TOKEN);
}

bootstrap();
