import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bull';
import { PromptCreatedEvent } from 'src/boundary-context/prompt/events/prompt-created/prompt-created.event';
import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';
import { CompletionTask } from '../processors/completion.processor';
import { CompletionGeneratedEvent } from '../events/completion-generated/completion-generated.event';
import { TextChannel } from 'discord.js';
import { DiscordService } from 'src/application/discord/discord.service';

@Injectable()
export class AfterCompletionGeneratedConsumer {
  constructor(private discord: DiscordService) {}

  @OnEvent('prompt.created')
  async afterPromptCreated(event: CompletionGeneratedEvent) {
    // Add new task in queue for generation of content
    // Produce this job as separate event called "GenerationQueuedEvent"
    // ...

    const deliveryTarget =
      event.payload.messageFromConversation.discord_channel_id;

    const channel = (await this.discord.channels.fetch(
      deliveryTarget,
    )) as unknown as TextChannel;

    await channel.send(event.payload.generationMade.completion);
  }
}
