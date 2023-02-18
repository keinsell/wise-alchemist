import "reflect-metadata";
import signale from "signale";
import { discordService } from "./application/discord/main.js";
import { config } from "dotenv";
import Container from "typedi";
import { container } from "tsyringe";
import { CreatePromptUsecase } from "./bounded-context/prompt/usecases/create-prompt/create-prompt.usecase.js";
import { PrismaService } from "./infrastructure/prisma/prisma.infra.js";
import { GetConversationUsecase } from "./bounded-context/conversation/usecases/get-conversation/get-conversation.usecase.js";
import { PromptCreatedEventHandler } from "./bounded-context/prompt/subscribers/prompt-created.subscriber.js";

config();

signale.info("Setting up server configuration...");

if (!process.env.CHATGPT_AUTH_TOKEN || !process.env.CHATGPT_COOKIES) {
  signale.fatal("Could not find CHATGPT_* environment variables.");
  process.exit(1);
}

container.registerSingleton<PrismaService>(PrismaService, PrismaService);

container.register<CreatePromptUsecase>(
  CreatePromptUsecase,
  CreatePromptUsecase
);

container.register<GetConversationUsecase>(
  GetConversationUsecase,
  GetConversationUsecase
);

container.register<PromptCreatedEventHandler>(
  PromptCreatedEventHandler,
  PromptCreatedEventHandler
);

await discordService();
