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
  ) {}

  @Process()
  async complete(job: Job<CompletionTask>) {
    // Find a complete information about promptId provided in job.data
    const prompt = await this.prismaService.prompt.findUnique({
      where: {
        id: job.data.promptId,
      },
    });

    // Find right provider for provided model, and if model doesn't exist
    // in our system as supported one, move job to failed.
    const model = prompt.model;
    const isModelAvailable = AvailableModels[model];

    if (!isModelAvailable) {
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
      throw new Error('no provider available');
    }

    try {
      const generation = await provider.prompt(prompt);
    } catch (error) {
      this.logger.error(error);
      await job.moveToFailed(error);
      await job.retry();
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
