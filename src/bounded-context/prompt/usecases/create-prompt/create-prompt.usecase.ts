import { ok } from "neverthrow";
import { Usecase } from "../../../../shared/domain/usecase.shared.js";
import { PromptEntity } from "../../prompt.entity.js";
import { CreatePromptCommand } from "./create-prompt.command.js";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.infra.js";
import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export class CreatePromptUsecase
  implements Usecase<CreatePromptCommand, PromptEntity>
{
  constructor(private prismaService: PrismaService) {}
  async execute(input: CreatePromptCommand) {
    let createPromptInput: Prisma.PromptCreateInput = {
      content: input.payload.content,
      account: { connect: { id: input.payload.accountId } },
      messageId: input.payload.messageId,
      channelId: input.payload.channelId,
    };

    if (input.payload.conversationId) {
      createPromptInput.conversation = {
        connect: { id: input.payload.conversationId },
      };
    }

    const createPrompt = await this.prismaService.prompt.create({
      data: createPromptInput,
    });

    const prompt = PromptEntity.fromSnapshot(createPrompt);

    prompt.created();

    return ok(prompt);
  }
}
