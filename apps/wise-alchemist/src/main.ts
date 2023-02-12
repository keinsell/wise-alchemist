import { dirname, importx } from "@discordx/importer";
import type { Interaction, Message } from "discord.js";
import { IntentsBitField } from "discord.js";
import { ChatGPTPlusScrapper, ChatgptModel } from "chatgpt-plus-scrapper";

import { Client } from "discordx";
import { config } from "dotenv";

config();

// TODO: Nasłuchiwac na wiadomosci w wskazanym kanale
// TODO: Przy kazdej wiadomosci ktora jest dluzsza od 300 znakow wrzucac request do queue ktory wygeneruje response od gpt
// TODO: Po tym jak queue wygeneruje response, wyslac go na kanal w swiecie discord gdzie odbywaja sie dyskusje, wiadomosc musi koniecznie odpowiedziec na wiadomosc ktora byla dodana do queue

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
