import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';
import { ChannelType } from 'discord.js';
import { Logger } from '@nestjs/common';

@Discord()
export class OnMessage {
  private logger = new Logger('discord.on-message.event');

  @On({ event: 'messageCreate' })
  async messageCreate(
    [message]: ArgsOf<'messageCreate'>,
    client: Client,
  ): Promise<void> {
    this.logger.log({
      id: message.id,
      content: message.content,
    });
  }
}
