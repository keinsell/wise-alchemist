import { Injectable } from '@nestjs/common';
import { Prompt, Completion } from '@prisma/client';
import { ContentGenerationProvider } from 'src/boundary-context/completion/adapters/providers/content-generation/content-generation.provider';

@Injectable()
export class ChatgptLargeLanguageModelService
  implements ContentGenerationProvider
{
  prompt(prompt: Prompt): Promise<Completion> {
    throw new Error('Method not implemented.');
  }
}
