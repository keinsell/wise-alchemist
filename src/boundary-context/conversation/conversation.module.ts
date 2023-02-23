import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  exports: [ConversationService],
  providers: [ConversationService],
})
export class ConversationModule {}
