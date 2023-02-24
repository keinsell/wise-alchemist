import { JOB_REF, OnQueueActive, Process, Processor } from '@nestjs/bull';
import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';

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

  constructor(private prismaService: PrismaService) {}

  @Process()
  async complete(job: Job<LargeLanguageModelCompleteTask>) {
    this.logger.log(
      `Received job #${job.id} with data ${JSON.stringify(job.data)}`,
    );

    const conversationId: string = job.data.conversationId;
    const messageId: string = job.data.messageId;

    const conversation = await this.prismaService.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      return;
    }

    const message = await this.prismaService.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      return;
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
