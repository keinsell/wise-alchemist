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
    private eventEmitter: EventEmitter2, // @InjectQueue('large_language_model.complete') // private audioQueue: Queue<LargeLanguageModelCompleteTask>,
    private getConversation: GetConversationByDiscordChannelUsecase,
    private openConversation: OpenConversationByDiscordChannelUsecase,
  ) {}
  private logger = new Logger('discord.on-message.event');

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

    this.eventEmitter.emit(
      'message.authorized',
      new MessageAuthorizedEvent({ messageId: createdMessage.id }),
    );

    // const job = await this.audioQueue.add({
    //   conversationId: conversation.id,
    //   messageId: createdMessage.id,
    // });

    // TODO: Produce and publish event GotMessage. This event will be consumed by an other boundary context. The goal is to isolate this context from others and avoid cross-coupling.
  }
}
