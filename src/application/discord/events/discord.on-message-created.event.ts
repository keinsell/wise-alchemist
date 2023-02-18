import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";
import { generateUUID } from "../../../utils/uuid.js";
import { splitMessage } from "../../../utils/splitter.js";
import { ChannelType } from "discord.js";
import { GetAccountByDiscordUsecase } from "../../../bounded-context/account/usecase/get-account-by-discord/get-account-by-discord.usercase.js";
import { PrismaService } from "../../../infrastructure/prisma/prisma.infra.js";
import { GetAccountByDiscordCommand } from "../../../bounded-context/account/usecase/get-account-by-discord/get-account-by-discord.command.js";
import { GetConversationUsecase } from "../../../bounded-context/conversation/usecases/get-conversation/get-conversation.usecase.js";
import { GetConversationCommand } from "../../../bounded-context/conversation/usecases/get-conversation/get-conversation.command.js";
import { kv } from "../../../utils/kv.js";
import signale from "signale";
import { CreatePromptUsecase } from "../../../bounded-context/prompt/usecases/create-prompt/create-prompt.usecase.js";
import { CreatePromptCommand } from "../../../bounded-context/prompt/usecases/create-prompt/create-prompt.command.js";
import { injectable } from "tsyringe";

@Discord()
@injectable()
export class OnMessageCreated {
  constructor(
    private readonly getUser: GetAccountByDiscordUsecase,
    private readonly getConversation: GetConversationUsecase,
    private readonly createPrompt: CreatePromptUsecase
  ) {}

  @On({ event: "messageCreate" })
  async messageCreate(
    [message]: ArgsOf<"messageCreate">,
    client: Client
  ): Promise<void> {
    const blacklist: string[] = [];

    // Build specification for handling event.
    const isNotMentionedOnChannel = !message.mentions.has(client.user!.id);
    const isMessageSentByBot = message.author.bot;
    const isDirectMessage = message.channel.type === ChannelType.DM;
    const isMessageByOneOfBlacklistedUsers = blacklist.includes(
      message.author.id
    );

    if (isMessageSentByBot) {
      return;
    }

    // TODO: Check if account is blacklisted.
    // TODO: Check if channel is blacklisted.
    // TODO: Check if guild is blacklisted.

    signale.info(`Found valid message: ${message.id}`);

    // Check if message has txt attachments, if so - read them and concatenate content to original message.
    if (
      message.attachments.some((attachment) =>
        attachment.name?.endsWith(".txt")
      )
    ) {
      message.content += "\n";
      for (const attachment of message.attachments) {
        const file = await fetch(attachment[1].url).then((response) =>
          response.arrayBuffer()
        );
        const decoder = new TextDecoder();
        const content = decoder.decode(file);
        message.content += "\n\n" + content;
      }
    }

    // Find account for user who posted message.
    const accountResult = await this.getUser.execute(
      new GetAccountByDiscordCommand({ discordUserId: message.author.id })
    );

    if (accountResult.isErr()) return;
    const account = accountResult._unsafeUnwrap();

    // TODO: Find conversation for channel where message was posted.
    let conversationId: string | undefined = undefined;

    const conversationResult = await this.getConversation.execute(
      new GetConversationCommand({
        channelId: message.channel.id,
      })
    );

    const conversation = conversationResult._unsafeUnwrap();

    if (conversation) {
      conversationId = conversation.id;
    }

    // TODO: Create prompt for account and conversation.
    const promptResult = await this.createPrompt.execute(
      new CreatePromptCommand({
        accountId: account.getSnapshot().id,
        conversationId: conversationId,
        content: message.content,
        channelId: message.channel.id,
        messageId: message.id,
      })
    );

    const prompt = promptResult._unsafeUnwrap();

    const typingInterval = setInterval(async () => {
      const state = await prompt.getState();
      signale.info(`State for ${prompt.getSnapshot().id}: ${state}`);
      if (state === "generating" || state === "pending") {
        message.channel.sendTyping();
      } else {
        clearInterval(typingInterval);
      }
    }, 1000);
  }
}
