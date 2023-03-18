import { Injectable } from '@nestjs/common';
import { Conversation } from '@prisma/client';
import { Either } from 'fp-ts/lib/Either';
import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';
import { Exception } from 'src/shared/domain-error';
import { Usecase } from 'src/shared/domain-usecase';
import { ChangeModelByDiscordChannelRequest } from './change-model-by-discord-channel.request';

@Injectable()
export class ChangeModelByDiscordChannelUsecase extends Usecase<
  ChangeModelByDiscordChannelRequest,
  Conversation
> {
  constructor(private prisma: PrismaService) {
    super();
  }

  async execute(
    request: ChangeModelByDiscordChannelRequest,
  ): Promise<Either<Exception, Conversation>> {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        discord_channel_id: request.discordChannelId,
        model: request.model,
        isArchived: false,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    if (conversation) {
      const foundConversation = await this.prisma.conversation.update({
        where: {
          id: conversation.id,
        },
        data: {
          timestamp: new Date(),
        },
      });

      return this.success(foundConversation);
    }

    const newConversation = await this.prisma.conversation.create({
      data: {
        account: {
          connect: {
            id: request.accountId,
          },
        },
        discord_channel_id: request.discordChannelId,
        model: request.model,
        isArchived: false,
      },
    });

    return this.success(newConversation);
  }
}
