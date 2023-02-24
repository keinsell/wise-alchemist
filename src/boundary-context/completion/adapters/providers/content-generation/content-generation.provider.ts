import { Completion, Prompt } from '@prisma/client';

export interface ContentGenerationProvider {
  prompt(prompt: Prompt): Promise<Completion>;
}
