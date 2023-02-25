import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bull';
import { PromptCreatedEvent } from 'src/boundary-context/prompt/events/prompt-created/prompt-created.event';
import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';
import { DiscordService } from '../discord.service';
import { MessageCreatedEvent } from 'src/boundary-context/message/events/message-created/message-created.event';
import { DMChannel, Message as DiscordMessage, TextChannel } from 'discord.js';

@Injectable()
export class AfterMessageCreatedConsumer {
  constructor(private discord: DiscordService, private prisma: PrismaService) {}

  @OnEvent('message.created')
  async afterPromptCreated(event: MessageCreatedEvent) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: event.payload.message.conversation_id },
      select: { id: true, discord_channel_id: true },
    });

    const parentMessageQuery = await this.prisma.message.findUnique({
      where: { id: event.payload.previousMessageId },
    });

    const parentMessageDiscordId = parentMessageQuery?.discord_message_id[0];

    const channel = (await this.discord.channels.fetch(
      conversation.discord_channel_id,
    )) as TextChannel;

    const chunks = this.splitMessage(event.payload.message.content);

    for (let chunk of chunks) {
      const message = await this.sendMessageToDiscordChannelId(
        channel.id,
        chunk,
        parentMessageDiscordId,
      );

      await this.addDiscordMessageToMessage(message, event.payload.message.id);
    }
  }

  private splitMessage(message: string) {
    const MAX_LENGTH = 2000;
    const chunks: string[] = [];
    let currentChunk = '';
    let currentLength = 0;
    for (let line of message.split('\n')) {
      if (currentLength + line.length > MAX_LENGTH) {
        chunks.push(currentChunk);
        currentChunk = '';
        currentLength = 0;
      }
      currentChunk += line + '\n';
      currentLength += line.length + 1;
    }
    if (currentLength > 0) {
      chunks.push(currentChunk);
    }
    return chunks;
  }

  private async sendMessageToDiscordChannelId(
    channelId: string,
    message: string,
    replyToId?: string,
  ): Promise<DiscordMessage> {
    const channel = await this.discord.channels.fetch(channelId);

    if (!channel) return;

    // When replying to messages, we should check for existance of message before
    // we'll reply, as replying to deleted messages causes an error.
    // https://github.com/keinsell/wise-alchemist/issues/12

    let isReplyAllowed: boolean = false;

    if (replyToId) {
      const textChannel = channel as TextChannel;
      const isMessage = await textChannel.messages.fetch(replyToId);
      if (isMessage) {
        isReplyAllowed = true;
      }
    }

    // Handle sending messages in DMs
    if (channel.isDMBased()) {
      const dmChannel = channel as unknown as DMChannel;
      return await dmChannel.send(message);
    }

    // Handle sending messages in channels
    if (channel.isTextBased()) {
      const textChannel = channel as unknown as TextChannel;
      return await textChannel.send({
        reply:
          replyToId && isReplyAllowed
            ? { messageReference: replyToId }
            : undefined,
        content: message,
      });
    }
  }

  private async addDiscordMessageToMessage(
    message: DiscordMessage,
    messageId: string,
  ) {
    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        discord_message_id: {
          push: message.id,
        },
      },
    });
  }
}
