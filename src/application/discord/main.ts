import { dirname, importx } from "@discordx/importer";
import { Interaction, Message, Partials } from "discord.js";
import { IntentsBitField } from "discord.js";
import { Client, DIService, tsyringeDependencyRegistryEngine } from "discordx";
import { config } from "dotenv";
import { kv } from "../../utils/kv.js";
import signale from "signale";
import { ChatgptModel } from "../../utils/scrapper.js";
import { prisma } from "../../infrastructure/prisma.infra.js";
import { container } from "tsyringe";

export const bot = new Client({
  // To use only guild command
  // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

  // Discord intents
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

  // Debug logs are disabled in silent mode
  silent: false,

  // Configuration for @SimpleCommand
  simpleCommand: {
    prefix: "!",
  },
});

bot.on("ready", async () => {
  // Make sure all guilds are cached
  await bot.guilds.fetch();

  // Synchronize applications commands with Discord
  await bot.initApplicationCommands();

  // To clear all guild commands, uncomment this line,
  // This is useful when moving from guild commands to global commands
  // It must only be executed once
  //
  await bot.clearApplicationCommands(...bot.guilds.cache.map((g) => g.id));

  signale.success("Wise alchemist has woken!");
});

bot.on("interactionCreate", (interaction: Interaction) => {
  bot.executeInteraction(interaction);
});

bot.on("messageCreate", async (message: Message) => {
  bot.executeCommand(message);
});

export async function discordService() {
  DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container);
  // The following syntax should be used in the ECMAScript environment

  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  // Let's start the bot
  if (!process.env.BOT_TOKEN) {
    throw Error("Could not find BOT_TOKEN in your environment");
  }

  // Log in with your bot token
  await bot.login(process.env.BOT_TOKEN);
}
