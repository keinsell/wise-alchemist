import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { ChatgptLargeLanguageModelService } from '../provider/chatgpt/chatgpt.large-language-model.service';
import { MessageModule } from '../../message/message.module';
import { ConversationModule } from '../../conversation/conversation.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    PrismaModule,
    MessageModule,
    ConversationModule,
    BullModule.registerQueue({
      name: 'completion',
    }),
  ],
  exports: [ChatgptLargeLanguageModelService],
  providers: [ChatgptLargeLanguageModelService],
})
export class LargeLanguageModelModule {}
