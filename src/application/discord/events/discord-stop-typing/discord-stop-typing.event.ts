import { DomainEvent } from 'src/shared/domain-event';

export interface DiscordStopTypingEventPayload {
  channelId: string;
}

export class DiscordStopTypingEvent extends DomainEvent<DiscordStopTypingEventPayload> {
  constructor(payload: DiscordStopTypingEventPayload) {
    super(payload);
  }

  static get EVENT_NAME(): string {
    return 'discord.stop-typing';
  }
}
