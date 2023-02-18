import { Result, err, ok } from "neverthrow";
import { Usecase } from "../../../../shared/domain/usecase.shared.js";
import { ConversationEntity } from "../../conversation.entity.js";
import { GetConversationCommand } from "./get-conversation.command.js";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.infra.js";
import { injectable } from "tsyringe";

@injectable()
export class GetConversationUsecase
  implements
    Usecase<GetConversationCommand, ConversationEntity | undefined, never>
{
  constructor(private prisma: PrismaService) {}

  async execute(
    input: GetConversationCommand
  ): Promise<Result<ConversationEntity | undefined, never>> {
    // Find conversation by id
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        channelId: input.payload.channelId,
        isClosed: false,
      },
    });

    if (!conversation) {
      // Return undefined if conversation does not exist
      return ok(undefined);
    }

    return ok(ConversationEntity.fromSnapshot(conversation));
  }
}
