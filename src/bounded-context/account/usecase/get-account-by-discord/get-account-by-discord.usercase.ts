import { Result, ok } from "neverthrow";
import { Usecase } from "../../../../shared/domain/usecase.shared.js";
import { AccountEntity } from "../../account.entity.js";
import { GetAccountByDiscordCommand } from "./get-account-by-discord.command.js";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.infra.js";
import { injectable } from "tsyringe";

@injectable()
export class GetAccountByDiscordUsecase
  implements Usecase<GetAccountByDiscordCommand, AccountEntity, never>
{
  constructor(private prisma: PrismaService) {}

  async execute(
    input: GetAccountByDiscordCommand
  ): Promise<Result<AccountEntity, never>> {
    // Find user by Discord ID in the database.
    const account = await this.prisma.account.findFirst({
      where: {
        discordId: input.payload.discordUserId,
      },
    });

    if (!account) {
      // Create a new account if one doesn’t exist.
      return this.createAccount(input.payload.discordUserId);
    }

    return ok(AccountEntity.fromSnapshot(account));
  }

  async createAccount(discordId: string) {
    const newAccount = await this.prisma.account.create({
      data: {
        discordId,
      },
    });

    return ok(AccountEntity.fromSnapshot(newAccount));
  }
}
