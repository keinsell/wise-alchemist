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
  silent: false,

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

let isWorking = false;
let preivousMessage: string | undefined = undefined;
let conversationId: string | undefined = undefined;

bot.on("messageCreate", async (message: Message) => {
  bot.executeCommand(message);

  // If message is made by bot, do not proceed further
  if (message.author.bot) return;

  // Check if message in on allowed "random" channel.
  if (message.channel.id !== "1074137070395740250") return;

  // Proceed with chatting with users as GPT.
  const scrapper = new ChatGPTPlusScrapper(
    ChatgptModel.turbo,
    process.env.CHATGPT_AUTH_TOKEN!,
    process.env.CHATGPT_COOKIES!
  );

  // If bot is working, check again every 5 seconds until it is free.
  while (isWorking) {
    await new Promise((resolve) => {
      message.channel.sendTyping();
      setTimeout(resolve, 500);
    });
  }

  // Set bot as working.
  isWorking = true;

  const typingInterval = setInterval(() => {
    message.channel.sendTyping();
  }, 1000);

  // Use chat method to generate response 1 second later
  const response = await scrapper.request(
    message.content,
    preivousMessage,
    conversationId
  );

  isWorking = false;

  // Log response to the console
  console.log(response);

  // Log conversation id
  console.log(response?.conversation_id);
  conversationId = response?.conversation_id;

  // Log previous message.
  console.log(preivousMessage);
  preivousMessage = response?.message.id;

  clearInterval(typingInterval);

  // Send response to the discord channel.
  message.reply({
    content: response?.message.content.parts[0]!,
  });
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
