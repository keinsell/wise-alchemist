import { DomainEvent } from 'src/shared/domain-event';

export interface DiscordStartTypingEventPayload {
  channelId: string;
}

export class DiscordStartTypingEvent extends DomainEvent<DiscordStartTypingEventPayload> {
  constructor(payload: DiscordStartTypingEventPayload) {
    super(payload);
  }

  static get EVENT_NAME(): string {
    return 'discord.start-typing';
  }
}
