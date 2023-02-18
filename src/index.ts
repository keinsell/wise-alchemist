import "reflect-metadata";
import { container } from "tsyringe";
import { DependencyInjector } from "./infrastructure/dependency-injector/dependency-injector.infra.js";
import { PromptEventBus } from "./bounded-context/prompt/infrastructure/prompt.event-bus.js";
import { PrismaService } from "./infrastructure/prisma/prisma.infra.js";
import { GetAccountByDiscordUsecase } from "./bounded-context/account/usecase/get-account-by-discord/get-account-by-discord.usercase.js";
import { CreatePromptUsecase } from "./bounded-context/prompt/usecases/create-prompt/create-prompt.usecase.js";

async function main() {
  const container = DependencyInjector.init();
  console.log(container);

  const prisma = container.resolve(PrismaService);
  const accounts = await prisma.account.findMany();
  console.log(accounts);

  container.resolve(CreatePromptUsecase);
}

main();
