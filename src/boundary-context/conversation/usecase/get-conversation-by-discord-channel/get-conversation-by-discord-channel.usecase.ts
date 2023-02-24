import { Injectable } from '@nestjs/common';
import { Conversation } from '@prisma/client';
import { Either } from 'fp-ts/lib/Either';
import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';
import { Exception } from 'src/shared/domain-error';
import { Usecase } from 'src/shared/domain-usecase';

@Injectable()
export class GetConversationByDiscordChannelUsecase extends Usecase<
  string,
  Conversation
> {
  constructor(private prisma: PrismaService) {
    super();
  }

  async execute(request: string): Promise<Either<Exception, Conversation>> {
    // Find latest open conversation for provided discord channel.
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        discord_channel_id: request,
        isArchived: false,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    if (!conversation) {
      return this.fail(new Exception('No conversation available'));
    }

    return this.success(conversation);
  }
}
