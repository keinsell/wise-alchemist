import {
  InjectQueue,
  JOB_REF,
  OnQueueActive,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import Bull, { Job } from 'bull';
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
import ms from 'ms';
import { captureException, startTransaction } from '@sentry/node';

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
    @InjectQueue('completion') private completionQueue: Bull.Queue,
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
      [ContentGenerationProviderType.openai]: undefined,
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

    const generationTransaction = startTransaction({
      op: 'content-generation',
      name: 'Content generation',
      description: `Content generation for prompt ${prompt.id} using ${model} model`,
      tags: {
        user: prompt.message.author,
      },
    });

    try {
      await provider.prompt(prompt);
    } catch (error) {
      captureException(error);

      generationTransaction.setTag('transaction_status', 'error');
      generationTransaction.setStatus('error');

      this.logger.error(error);

      if (discordStopTypingEvent) {
        this.publisher.emit(
          DiscordStopTypingEvent.EVENT_NAME,
          discordStopTypingEvent,
        );
      }

      await job.moveToFailed(error);
    } finally {
      generationTransaction.finish();
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

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed with message: ${error.message}`,
      error.stack,
    );

    job.attemptsMade++;

    if (job.attemptsMade > 3) {
      return;
    }

    const delay = ms('1m') * Math.pow(2, job.attemptsMade);

    this.logger.debug(
      `Will retry job ${job.id} in ${ms(delay, {
        long: true,
      })} (attempt ${job.attemptsMade} of 3)...`,
    );

    this.logger.debug(`Adding job ${job.id} to completion queue...`);

    await this.completionQueue.add(job.data, {
      delay,
    });
  }
}
