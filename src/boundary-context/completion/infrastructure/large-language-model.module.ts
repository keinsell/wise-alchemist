import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { ChatgptLargeLanguageModelService } from '../providers/content-generation/chatgpt/chatgpt.large-language-model.service';
import { MessageModule } from '../../message/message.module';
import { ConversationModule } from '../../conversation/conversation.module';
import { BullModule } from '@nestjs/bull';
import { LargeLanguageModelCompletionConsumer } from '../processors/complete.consumer';

@Module({
  imports: [
    PrismaModule,
    MessageModule,
    ConversationModule,
    BullModule.registerQueue({
      name: 'large_language_model.complete',
    }),
  ],
  exports: [
    LargeLanguageModelCompletionConsumer,
    ChatgptLargeLanguageModelService,
    BullModule.registerQueue({
      name: 'large_language_model.complete',
    }),
  ],
  providers: [
    ChatgptLargeLanguageModelService,
    LargeLanguageModelCompletionConsumer,
  ],
})
export class LargeLanguageModelModule {}
