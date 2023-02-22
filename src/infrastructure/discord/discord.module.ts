import { Module } from '@nestjs/common';
import { DiscordProvider } from './discord.provider';
import { Interaction, Message, Partials } from 'discord.js';
import { IntentsBitField } from 'discord.js';

@Module({
  imports: [],
  exports: [DiscordProvider],
  providers: [DiscordProvider],
})
export class DiscordModule {}
