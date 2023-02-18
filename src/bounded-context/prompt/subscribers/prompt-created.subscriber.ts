import signale from "signale";
import { PrismaService } from "../../../infrastructure/prisma/prisma.infra.js";
import { EventHandler } from "../../../shared/domain/events/event-handler.shared.js";
import { GenerationJobQueue } from "../../message/infrastructure/message.job-queue.js";
import { PromptNotFound } from "../errors/prompt-not-found.error.js";
import { PromptCreatedEvent } from "../events/prompt-created.event.js";
import { PromptEntity } from "../prompt.entity.js";
import { injectable } from "tsyringe";
import { EventSubscriber, On } from "event-dispatch";

@injectable()
@EventSubscriber()
export class PromptCreatedEventHandler
  implements EventHandler<PromptCreatedEvent>
{
  constructor(
    private prismaService: PrismaService,
    private generationQueue: GenerationJobQueue
  ) {}

  @On("prompt-created")
  async handle(event: PromptCreatedEvent): Promise<void> {
    await this.generationQueue.addJob({ promptId: event.payload.id });
    signale.info(`Added prompt ${event.payload.id} to queue.`);
  }
}
