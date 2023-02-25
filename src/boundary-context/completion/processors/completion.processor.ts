import { JOB_REF, OnQueueActive, Process, Processor } from '@nestjs/bull';
import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';
import { ChatgptModel } from '../providers/content-generation/chatgpt/chatgpt.model';
import { ChatgptLargeLanguageModelService } from '../providers/content-generation/chatgpt/chatgpt.large-language-model.service';
import { Message, Prompt } from '@prisma/client';
import {
  AvailableModels,
  ContentGenerationProviderType,
} from '../configuration/model-selection.configuration';
import { ContentGenerationProvider } from '../adapters/providers/content-generation/content-generation.provider';
import { DiscordStartTypingEvent } from 'src/application/discord/events/discord-start-typing/discord-start-typing.event';
import { DiscordStopTypingEvent } from 'src/application/discord/events/discord-stop-typing/discord-stop-typing.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface CompletionTask {
  promptId: number;
  messageId: string;
  message: Message;
  prompt: Prompt;
}

@Injectable()
@Processor({
  scope: Scope.DEFAULT,
  name: 'completion',
})
export class CompletionProcessor {
  private readonly logger = new Logger(CompletionProcessor.name);

  constructor(
    private prismaService: PrismaService,
    private chatgpt: ChatgptLargeLanguageModelService,
    private publisher: EventEmitter2,
  ) {}

  @Process()
  async complete(job: Job<CompletionTask>) {
    // Find a complete information about promptId provided in job.data
    const prompt = await this.prismaService.prompt.findUnique({
      where: {
        id: job.data.prompt.id,
      },
      include: {
        message: {
          include: {
            conversation: {
              select: {
                discord_channel_id: true,
              },
            },
          },
        },
      },
    });

    let discordStartTypingEvent: DiscordStartTypingEvent;
    let discordStopTypingEvent: DiscordStopTypingEvent;

    if (prompt?.message?.conversation?.discord_channel_id) {
      discordStartTypingEvent = new DiscordStartTypingEvent({
        channelId: prompt.message.conversation.discord_channel_id,
      });
      discordStopTypingEvent = new DiscordStopTypingEvent({
        channelId: prompt.message.conversation.discord_channel_id,
      });
    }

    // Start typing
    if (discordStartTypingEvent) {
      this.publisher.emit(
        DiscordStartTypingEvent.EVENT_NAME,
        discordStartTypingEvent,
      );
    }

    // Find right provider for provided model, and if model doesn't exist
    // in our system as supported one, move job to failed.
    const model = prompt.model;
    const isModelAvailable = AvailableModels[model];

    if (!isModelAvailable) {
      if (discordStopTypingEvent) {
        this.publisher.emit(
          DiscordStopTypingEvent.EVENT_NAME,
          discordStopTypingEvent,
        );
      }

      throw new Error('model is not supported');
    }

    // Build a map of available providers to ContentGenerationProvider enum.
    const availableProvidersMap: {
      [key in ContentGenerationProviderType]: ContentGenerationProvider;
    } = {
      [ContentGenerationProviderType.chatgpt]: this.chatgpt,
    };

    // Find a provider responsible for provided model.
    const provider = availableProvidersMap[isModelAvailable];

    // If we can't find a provider, move job to failed.
    if (!provider) {
      if (discordStopTypingEvent) {
        this.publisher.emit(
          DiscordStopTypingEvent.EVENT_NAME,
          discordStopTypingEvent,
        );
      }

      throw new Error('no provider available');
    }

    try {
      await provider.prompt(prompt);
    } catch (error) {
      this.logger.error(error);

      if (discordStopTypingEvent) {
        this.publisher.emit(
          DiscordStopTypingEvent.EVENT_NAME,
          discordStopTypingEvent,
        );
      }

      await job.moveToFailed(error);
      await job.retry();
    }

    if (discordStopTypingEvent) {
      this.publisher.emit(
        DiscordStopTypingEvent.EVENT_NAME,
        discordStopTypingEvent,
      );
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(
      `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(
        job.data,
      )}...`,
    );
  }
}
