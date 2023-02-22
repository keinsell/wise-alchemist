import { Injectable } from '@nestjs/common';
import { Account } from '@prisma/client';
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
}
