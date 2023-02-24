import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { AfterMessageAuthorizedCustomer } from '../consumers/after.message-authorized.consumer';

@Module({
  imports: [PrismaModule],
  providers: [AfterMessageAuthorizedCustomer],
  exports: [AfterMessageAuthorizedCustomer],
})
export class PromptModule {}
