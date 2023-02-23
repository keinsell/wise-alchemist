import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  exports: [AccountService],
  providers: [AccountService],
})
export class AccountModule {}
