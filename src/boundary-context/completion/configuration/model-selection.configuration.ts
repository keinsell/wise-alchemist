import { ChatgptModel } from '../providers/content-generation/chatgpt/chatgpt.model';

export enum ContentGenerationProviderType {
  chatgpt = 'chatgpt',
  //   edgegpt = 'edgegpt',
  //   openai = 'openai',
}

export const AvailableModels: {
  [key in string]: ContentGenerationProviderType;
} = {
  [ChatgptModel.turbo]: ContentGenerationProviderType.chatgpt,
  [ChatgptModel.normal]: ContentGenerationProviderType.chatgpt,
};
