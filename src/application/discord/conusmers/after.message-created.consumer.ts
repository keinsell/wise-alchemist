import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bull';
import { PromptCreatedEvent } from 'src/boundary-context/prompt/events/prompt-created/prompt-created.event';
import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';
import { DiscordService } from '../discord.service';
import { MessageCreatedEvent } from 'src/boundary-context/message/events/message-created/message-created.event';
import { TextChannel } from 'discord.js';

@Injectable()
export class AfterMessageCreatedConsumer {
  constructor(
    private publisher: EventEmitter2,
    private discord: DiscordService,
    private prisma: PrismaService,
  ) {}

  @OnEvent('message.created')
  async afterPromptCreated(event: MessageCreatedEvent) {
    // TODO: Check if message is Discord message.

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: event.payload.message.conversation_id },
      select: { id: true, discord_channel_id: true },
    });

    const channel = (await this.discord.channels.fetch(
      conversation.discord_channel_id,
    )) as TextChannel;

    await channel.send(event.payload.message.content);
  }
}
