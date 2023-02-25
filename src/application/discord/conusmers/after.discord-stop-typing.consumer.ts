import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import ms from 'ms';
import { DiscordStopTypingEvent } from '../events/discord-stop-typing/discord-stop-typing.event';
import { Cache } from 'cache-manager';

@Injectable()
export class AfterDiscordStopTypingConsumer {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @OnEvent(DiscordStopTypingEvent.EVENT_NAME)
  async afterDiscordStopTyping(event: DiscordStopTypingEvent) {
    await this.cacheManager.set(
      `typing-${event.payload.channelId}`,
      false,
      ms('1m'),
    );
  }
}
