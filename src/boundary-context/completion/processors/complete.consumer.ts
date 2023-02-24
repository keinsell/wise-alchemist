import { JOB_REF, OnQueueActive, Process, Processor } from '@nestjs/bull';
import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';
import { ChatgptModel } from '../providers/content-generation/chatgpt/chatgpt.model';
import { ChatgptLargeLanguageModelService } from '../providers/content-generation/chatgpt/chatgpt.large-language-model.service';
import { Message } from '@prisma/client';

export interface LargeLanguageModelCompleteTask {
  conversationId: string;
  messageId: string;
}

@Injectable()
@Processor({
  scope: Scope.DEFAULT,
  name: 'large_language_model.complete',
})
export class LargeLanguageModelCompletionConsumer {
  private readonly logger = new Logger(
    LargeLanguageModelCompletionConsumer.name,
  );

  constructor(
    private prismaService: PrismaService,
    private chatgpt: ChatgptLargeLanguageModelService,
  ) {}

  @Process()
  async complete(job: Job<LargeLanguageModelCompleteTask>) {
    this.logger.log(
      `Received job #${job.id} with data ${JSON.stringify(job.data)}`,
    );

    const conversationId: string = job.data.conversationId;
    const messageId: string = job.data.messageId;

    // Find conversation where message was sent.

    const conversation = await this.prismaService.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      this.logger.error(
        `Tried to complete message that isn't from a conversation. MessageId: ${messageId}`,
      );
      return;
    }

    this.logger.debug(
      `Found conversation, conversation details: ${JSON.stringify(
        conversation,
      )}`,
    );

    // Find message provided for generation.

    const message = await this.prismaService.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      this.logger.error(
        `Tried to complete message that isn't existing. MessageId: ${messageId}`,
      );
      return;
    }

    this.logger.debug(
      `Found message, message details: ${JSON.stringify(message)}`,
    );

    // Find model that was used to generate the message
    let model = conversation.model;

    if (!model) {
      this.logger.warn(
        `No model found for conversation id ${conversationId}, model was not provided. Fallbacking to default model (${ChatgptModel.turbo})`,
      );
      model = ChatgptModel.turbo;
    }

    this.logger.log(`Using model ${model} for message ${messageId}`);

    // Handle models for proper generation services.

    let completionResult: Message | undefined;

    if (Object.values(ChatgptModel).includes(model as any)) {
      try {
        completionResult = await this.chatgpt.promptMessage(message.content, {
          model: model as any,
          conversation: conversation,
        });
      } catch (error) {
        await job.moveToFailed(error);
        await job.retry();
      }

      this.logger.debug(
        `Got response ${completionResult} for message ${messageId} (${message.content}) while completing task`,
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
