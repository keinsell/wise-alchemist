import { prisma } from "./infrastructure/prisma.infra.js";
import { discord } from "./infrastructure/discord.infra.js";
import { config } from "dotenv";
import { llmQueue } from "./llm.worker.js";
import { dirname, importx } from "@discordx/importer";
import { Interaction, Message, Partials } from "discord.js";
import { IntentsBitField } from "discord.js";
import { Client } from "discordx";
import signale from "signale";

config();

signale.info("Setting up server configuration...");

async function run() {
  discord.on("ready", async () => {
    // Make sure all guilds are cached
    await discord.guilds.fetch();

    // Synchronize applications commands with Discord
    await discord.initApplicationCommands();

    // To clear all guild commands, uncomment this line,
    // This is useful when moving from guild commands to global commands
    // It must only be executed once
    //
    await discord.clearApplicationCommands(
      ...discord.guilds.cache.map((g) => g.id)
    );

    signale.success("Wise alchemist has woken!");
  });

  discord.on("interactionCreate", (interaction: Interaction) => {
    discord.executeInteraction(interaction);
  });

  discord.on("messageCreate", async (message: Message) => {
    discord.executeCommand(message);
  });

  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  // Let's start the bot
  if (!process.env.BOT_TOKEN) {
    throw Error("Could not find BOT_TOKEN in your environment");
  }

  // Log in with your bot token
  await discord.login(process.env.BOT_TOKEN);

  await prisma.$connect();
  await llmQueue.empty();
}

run();
