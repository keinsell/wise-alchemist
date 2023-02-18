import { PrismaService } from "../prisma/prisma.infra.js";
import { CreatePromptUsecase } from "../../bounded-context/prompt/usecases/create-prompt/create-prompt.usecase.js";
import { PromptCreatedEventHandler } from "../../bounded-context/prompt/subscribers/prompt-created.subscriber.js";
import { GetConversationUsecase } from "../../bounded-context/conversation/usecases/get-conversation/get-conversation.usecase.js";
import { GetAccountByDiscordUsecase } from "../../bounded-context/account/usecase/get-account-by-discord/get-account-by-discord.usercase.js";
import { MessageGeneratedEventHandler } from "../../bounded-context/message/subscribers/message-generated.subscriber.js";
import { ChatgptArtifictialIntelligenceProvider } from "../../bounded-context/message/providers/chatgpt/chatgpt.artifictial-intelligence-provider.js";
import { container } from "tsyringe";
import { GenerationJobQueue } from "../../bounded-context/message/infrastructure/message.job-queue.js";
import { OnMessageCreated } from "../../application/discord/events/discord.on-message-created.event.js";
import { GlobalEventBus } from "../event-bus/memory.event-bus.infra.js";

export class DependencyInjector {
  static init() {
    // --------------------------------
    // Infrastructure (Connections)
    // --------------------------------

    container.registerSingleton<PrismaService>(PrismaService, PrismaService);

    // --------------------------------
    // Providers
    // --------------------------------

    container.registerInstance(
      ChatgptArtifictialIntelligenceProvider,
      new ChatgptArtifictialIntelligenceProvider(
        container.resolve(PrismaService)
      )
    );

    // --------------------------------
    // Job Queues
    // --------------------------------

    container.registerInstance(
      GenerationJobQueue,
      new GenerationJobQueue(
        container.resolve(PrismaService),
        container.resolve(ChatgptArtifictialIntelligenceProvider)
      )
    );

    // --------------------------------
    // Event Handers
    // --------------------------------

    container.registerInstance(
      MessageGeneratedEventHandler,
      new MessageGeneratedEventHandler(container.resolve(PrismaService))
    );

    container.registerInstance(
      PromptCreatedEventHandler,
      new PromptCreatedEventHandler(
        container.resolve(PrismaService),
        container.resolve(GenerationJobQueue)
      )
    );

    GlobalEventBus.subscribe(
      "prompt-created",
      container.resolve(PromptCreatedEventHandler)
    );

    GlobalEventBus.subscribe(
      "message-generated",
      container.resolve(MessageGeneratedEventHandler)
    );

    // --------------------------------
    // Usecases Application Layer
    // --------------------------------

    container.registerInstance(
      CreatePromptUsecase,
      new CreatePromptUsecase(container.resolve(PrismaService))
    );

    container.registerInstance(
      GetAccountByDiscordUsecase,
      new GetAccountByDiscordUsecase(container.resolve(PrismaService))
    );

    container.registerInstance(
      GetConversationUsecase,
      new GetConversationUsecase(container.resolve(PrismaService))
    );

    // --------------------------------
    // Presentation Layer
    // --------------------------------

    container.registerInstance(
      OnMessageCreated,
      new OnMessageCreated(
        container.resolve(GetAccountByDiscordUsecase),
        container.resolve(GetConversationUsecase),
        container.resolve(CreatePromptUsecase)
      )
    );

    return container;
  }
}
