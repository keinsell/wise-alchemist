import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bull';
import { PromptCreatedEvent } from 'src/boundary-context/prompt/events/prompt-created/prompt-created.event';
import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';
import { CompletionTask } from '../processors/completion.processor';

@Injectable()
export class AfterPromptCreatedConsumer {
  constructor(
    private publisher: EventEmitter2,
    @InjectQueue('completion') private queue: Queue<CompletionTask>,
  ) {}

  @OnEvent('prompt.created')
  async afterPromptCreated(event: PromptCreatedEvent) {
    // Add new task in queue for generation of content
    // Produce this job as separate event called "GenerationQueuedEvent"

    const job = await this.queue.add({
      promptId: event.payload.prompt.id,
      messageId: event.payload.message.id,
      prompt: event.payload.prompt,
      message: event.payload.message,
    });

    // ...
  }
}
