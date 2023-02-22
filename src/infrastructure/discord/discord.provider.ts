import { Injectable, Provider } from '@nestjs/common';
import { Client } from 'discordx';
import { Interaction, Message, Partials } from 'discord.js';
import { IntentsBitField } from 'discord.js';

export const DISCORD_CLIENT = new Client({
  botId: '',
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

  // Configuration for @SimpleCommand
  simpleCommand: {
    prefix: '!',
  },
});

export const DiscordProvider: Provider = {
  provide: Client,
  useValue: DISCORD_CLIENT,
};
