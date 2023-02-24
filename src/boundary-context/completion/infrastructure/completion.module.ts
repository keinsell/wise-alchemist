import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { ChatgptLargeLanguageModelService } from '../providers/content-generation/chatgpt/chatgpt.large-language-model.service';
import { CompletionProcessor } from '../processors/completion.processor';
import { BullModule } from '@nestjs/bull';
import { AfterPromptCreatedConsumer } from '../consumers/after.prompt-created.consumer';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'completion',
    }),
  ],
  providers: [
    ChatgptLargeLanguageModelService,
    CompletionProcessor,
    AfterPromptCreatedConsumer,
  ],
  exports: [
    CompletionProcessor,
    BullModule.registerQueue({
      name: 'completion',
    }),
    AfterPromptCreatedConsumer,
  ],
})
export class CompletionModule {}
