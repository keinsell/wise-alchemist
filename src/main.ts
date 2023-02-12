import { dirname, importx } from "@discordx/importer";
import type { Interaction, Message } from "discord.js";
import { IntentsBitField } from "discord.js";
import { Client } from "discordx";
import { config } from "dotenv";
import { kv } from "./utils/kv.js";
import signale from "signale";
import { ChatgptModel } from "./utils/scrapper.js";

config();

signale.info("Setting up server configuration...");

if (!process.env.CHATGPT_AUTH_TOKEN || !process.env.CHATGPT_COOKIES) {
  signale.fatal("Could not find CHATGPT_* environment variables.");
  process.exit(1);
}

await kv.set("auth-token", process.env.CHATGPT_AUTH_TOKEN);
await kv.set("cookies", process.env.CHATGPT_COOKIES);
await kv.set("model", ChatgptModel.turbo);

export const bot = new Client({
  // To use only guild command
  // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

  // Discord intents
  intents: [
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessageTyping,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.Guilds,
  ],

  // Debug logs are disabled in silent mode
  silent: true,

  // Configuration for @SimpleCommand
  simpleCommand: {
    prefix: "!",
  },
});

bot.once("ready", async () => {
  // Make sure all guilds are cached
  await bot.guilds.fetch();

  // Synchronize applications commands with Discord
  await bot.initApplicationCommands();

  // To clear all guild commands, uncomment this line,
  // This is useful when moving from guild commands to global commands
  // It must only be executed once
  //
  await bot.clearApplicationCommands(...bot.guilds.cache.map((g) => g.id));
  console.log("Bot started");
});

bot.on("interactionCreate", (interaction: Interaction) => {
  bot.executeInteraction(interaction);
});

bot.on("messageCreate", async (message: Message) => {
  bot.executeCommand(message);
});

async function run() {
  // The following syntax should be used in the ECMAScript environment
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  // Let's start the bot
  if (!process.env.BOT_TOKEN) {
    throw Error("Could not find BOT_TOKEN in your environment");
  }

  // Log in with your bot token
  await bot.login(process.env.BOT_TOKEN);
}

run();
