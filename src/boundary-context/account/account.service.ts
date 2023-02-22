import { Injectable } from '@nestjs/common';
import { Account } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/infrastructure/prisma/prisma.infra';

@Injectable()
export class AccountService {
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

  public authenticateAccountByDiscordId(discordId: string): Promise<Account> {
    const findAccount = this.prisma.account.findFirst({
      where: {
        discord_id: discordId,
      },
    });

    if (!findAccount) {
      // Create account
      // Error: `discordId` is not known to TS
      return this.createAccountByDiscordId(discordId, randomUUID());
    }

    return findAccount;
  }
}
