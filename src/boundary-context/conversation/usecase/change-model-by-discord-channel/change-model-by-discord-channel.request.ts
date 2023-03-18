import { ChatgptModel } from 'src/boundary-context/completion/providers/content-generation/chatgpt/chatgpt.model';

export interface ChangeModelByDiscordChannelRequest {
  model: ChatgptModel;
  accountId: string;
  discordChannelId: string;
}
