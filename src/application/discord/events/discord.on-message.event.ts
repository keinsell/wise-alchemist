import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';
import { ChannelType } from 'discord.js';
import { Injectable, Logger } from '@nestjs/common';
import { AccountService } from 'src/boundary-context/account/account.service';
import { ConversationService } from 'src/boundary-context/conversation/conversation.service';

@Discord()
@Injectable()
export class OnMessage {
  constructor(
    private accountService: AccountService,
    private conversationService: ConversationService,
  ) {}

  private logger = new Logger('discord.on-message.event');

  @On({ event: 'messageCreate' })
  async messageCreate(
    [message]: ArgsOf<'messageCreate'>,
    client: Client,
  ): Promise<void> {
    // TODO: Add filters for messages to prevent catching everything
    const isNotMentionedOnChannel = !message.mentions.has(client.user!.id);
    const isMessageSentByBot = message.author.bot;
    const isDirectMessage = message.channel.type === ChannelType.DM;

    // Disallow responding to bot messages
    if (isMessageSentByBot) {
      return;
    }

    // Allow responding by mentioning or messaging in private (DM) channel
    if (isNotMentionedOnChannel) {
      if (!isDirectMessage) {
        return;
      }
    }

    // Authenticate user
    const account = await this.accountService.authenticateAccountByDiscordId(
      message.author.id,
    );

    // TODO: Check if account is valid.
    // TODO: Authenticate user that pass the filters

    this.logger.log(`Message ${message.id} authorized.`);

    // Start or find a conversation in the database

    const conversation =
      await this.conversationService.findOrCreateConversationByDiscordChannelId(
        account,
        message.channel.id,
      );

    // Construct new message

    // TODO: Produce and publish event GotMessage. This event will be consumed by an other boundary context. The goal is to isolate this context from others and avoid cross-coupling.
  }
}
