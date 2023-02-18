import { PrismaService } from "../../../infrastructure/prisma/prisma.infra.js";
import { EventHandler } from "../../../shared/domain/events/event-handler.shared.js";
import { GenerationJobQueue } from "../../message/infrastructure/message.job-queue.js";
import { injectable } from "tsyringe";
import { MessageGeneratedEvent } from "../events/message-generated.event.js";
import { MessageEntity } from "../message.entity.js";
import { PromptNotFound } from "../../prompt/errors/prompt-not-found.error.js";
import { PromptEntity } from "../../prompt/prompt.entity.js";
import { IntentsBitField, Partials } from "discord.js";
import { Client } from "discordx";
import { DiscordBot } from "../../../application/discord/main.js";

@injectable()
export class MessageGeneratedEventHandler
  implements EventHandler<MessageGeneratedEvent>
{
  constructor(private prismaService: PrismaService) {}
  async handle(event: MessageGeneratedEvent): Promise<void> {
    const message = await this.prismaService.message.findUnique({
      where: { id: event.payload.messageId },
    });

    if (!message) {
      throw new PromptNotFound();
    }

    const prompt = await this.prismaService.prompt.findUnique({
      where: { id: message.promptId },
    });

    if (!prompt) {
      throw new PromptNotFound();
    }

    const promptEntity = await PromptEntity.fromSnapshot(prompt);

    await promptEntity.setCompletedState();

    const messageEntity = MessageEntity.fromSnapshot(message);

    const channel = await DiscordBot.channels.fetch(message.channelId as any);

    if (!channel) return;
    if (!channel.isTextBased()) return;

    await channel.send(messageEntity.content);
  }
}
