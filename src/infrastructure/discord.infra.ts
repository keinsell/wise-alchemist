import { dirname, importx } from "@discordx/importer";
import { Interaction, Message, Partials } from "discord.js";
import { IntentsBitField } from "discord.js";
import { Client } from "discordx";
import signale from "signale";

export const discord = new Client({
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
  silent: true,

  // Configuration for @SimpleCommand
  simpleCommand: {
    prefix: "!",
  },
});

