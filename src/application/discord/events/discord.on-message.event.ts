import type { ArgsOf, Client } from 'discordx';
import { ChannelType } from 'discord.js';
import { Injectable, Logger } from '@nestjs/common';
import { AccountService } from 'src/boundary-context/account/account.service';
import { MessageService } from 'src/boundary-context/message/message.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MessageAuthorizedEvent } from 'src/boundary-context/message/events/message-authorized/message-authorized.event';
import { GetConversationByDiscordChannelUsecase } from 'src/boundary-context/conversation/usecase/get-conversation-by-discord-channel/get-conversation-by-discord-channel.usecase';
import { isLeft } from 'fp-ts/lib/Either';
import { Conversation } from '@prisma/client';
import { OpenConversationByDiscordChannelUsecase } from 'src/boundary-context/conversation/usecase/open-conversation-by-discord-channel/open-conversation-by-discord-channel.usecase';
import { Exception } from 'src/shared/domain-error';

@Injectable()
export class DiscordOnMessageEvent {
  constructor(
    private accountService: AccountService,
    private messageService: MessageService,
    private eventEmitter: EventEmitter2,
    private getConversation: GetConversationByDiscordChannelUsecase,
    private openConversation: OpenConversationByDiscordChannelUsecase,
  ) {}
  private logger = new Logger('discord.on-message.event');

  async messageCreate(
    [message]: ArgsOf<'messageCreate'>,
    client: Client,
  ): Promise<void> {
    // Filter messages that trigger event. System should most likely respond
    // only to direct messages (DM) or when it's mentioned on channel.
    // Optionally there will be feature to respond to every message on selected
    // channels for short preoid of time.

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

    // Find existing account that can be used for user contained in message,
    // If account was found - we need to authenticate it to check if it was
    // banned from bot usage. If user do not have account at all, we should
    // automatically generate one for him.

    const account = await this.accountService.authenticateAccountByDiscordId(
      message.author.id,
    );

    this.logger.log(`Message ${message.id} authorized.`);

    // Find an existing conversation in our system for given discord channel
    // If one conversation is not found, we're using account of user to create
    // a new one and associate it to discord channel.

    let conversation: Conversation;

    const isConversation = await this.getConversation.execute(
      message.channel.id,
    );

    if (isLeft(isConversation)) {
      this.logger.error(isConversation.left);

      const createdConversationResult = await this.openConversation.execute({
        channelId: message.channel.id,
        accountId: account.id,
      });

      if (isLeft(createdConversationResult)) {
        throw new Exception('Cannot open conversation.');
      }

      conversation = createdConversationResult.right;
    } else {
      conversation = isConversation.right;
    }

    // Construct new message

    const createdMessage = await this.messageService.createMessageFromDiscord(
      message,
      conversation,
    );

    this.logger.log(`Message ${createdMessage.id} created.`);

    // Complete message authorization by emitting an event.
    // This will be handled by futher parts of system.

    this.eventEmitter.emit(
      'message.authorized',
      new MessageAuthorizedEvent({ message: createdMessage }),
    );
  }
}
