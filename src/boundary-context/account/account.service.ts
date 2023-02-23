import { Injectable, Logger } from '@nestjs/common';
import { Account } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);
  constructor(private prisma: PrismaService) {}
  public async createAccountByDiscordId(
    discordId: string,
    username: string,
  ): Promise<Account> {
    return this.prisma.account.create({
      data: {
        username: username,
        discord_id: discordId,
      },
    });
  }

  public async authenticateAccountByDiscordId(
    discordId: string,
  ): Promise<Account> {
    const findAccount = await this.prisma.account.findFirst({
      where: {
        discord_id: discordId,
      },
    });

    if (!findAccount) {
      // Create account
      // Error: `discordId` is not known to TS
      return this.createAccountByDiscordId(discordId, randomUUID());
    }

    this.logger.log(`Authenticated account ${findAccount.id}`);

    return findAccount;
  }
}
