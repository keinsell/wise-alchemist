import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";
import { ChannelType, TextChannel } from "discord.js";
import { GetAccountByDiscordUsecase } from "../../../bounded-context/account/usecase/get-account-by-discord/get-account-by-discord.usercase.js";
import { GetAccountByDiscordCommand } from "../../../bounded-context/account/usecase/get-account-by-discord/get-account-by-discord.command.js";
import { GetConversationUsecase } from "../../../bounded-context/conversation/usecases/get-conversation/get-conversation.usecase.js";
import signale from "signale";
import { CreatePromptUsecase } from "../../../bounded-context/prompt/usecases/create-prompt/create-prompt.usecase.js";
import { CreatePromptCommand } from "../../../bounded-context/prompt/usecases/create-prompt/create-prompt.command.js";
import { injectable } from "tsyringe";
import { ConversationRepsotitory } from "../../../bounded-context/conversation/conversation.repository.js";
import { MessageRepository } from "../../../bounded-context/message/message.repository.js";

@Discord()
@injectable()
export class OnMessageCreated {
  constructor(
    private readonly getUser: GetAccountByDiscordUsecase,
    private readonly getConversation: GetConversationUsecase,
    private readonly createPrompt: CreatePromptUsecase,
    private readonly conversationRepository: ConversationRepsotitory,
    private readonly messageRepository: MessageRepository
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

    if (isNotMentionedOnChannel) {
      if (!isDirectMessage) {
        return;
      }
    }

    // Remove mention tag from message content.
    message.content = message.content
      .replace(new RegExp(`<@!?${client.user!.id}>`, "gi"), "")
      .trim();

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
        const contentx = decoder.decode(file);
        message.content += "\n\n" + contentx;
      }
    }

    // Find account for user who posted message.

    const accountResult = await this.getUser.execute(
      new GetAccountByDiscordCommand({ discordUserId: message.author.id })
    );

    if (accountResult.isErr()) return;
    const account = accountResult._unsafeUnwrap();

    // Find latest open conversation in selected Channel.

    let conversationId: string | undefined = undefined;
    let parentMessageId: string | undefined = undefined;

    const conversation =
      await this.conversationRepository.findLatestConversationByChannelId(
        message.channel.id
      );

    if (conversation) {
      conversationId = conversation.id;

      // Find latest message generated in specific conversation.
      const latestMessage =
        await this.messageRepository.findLatestMessageByConverationId(
          conversationId
        );

      if (latestMessage) {
        parentMessageId = latestMessage.id;
      }
    }

    // Find latest message generated in specific conversation.
    const promptResult = await this.createPrompt.execute(
      new CreatePromptCommand({
        accountId: account.getSnapshot().id,
        conversationId: conversationId,
        parentMessageId: parentMessageId,
        content: message.content,
        channelId: message.channel.id,
        messageId: message.id,
      })
    );

    const prompt = promptResult._unsafeUnwrap();

    const typingInterval = setInterval(async () => {
      const state = await prompt.getState();
      if (state === "generating") {
        const channel = message.channel as TextChannel;
        channel.sendTyping();
      } else {
        clearInterval(typingInterval);
      }
    }, 1000);
  }
}
