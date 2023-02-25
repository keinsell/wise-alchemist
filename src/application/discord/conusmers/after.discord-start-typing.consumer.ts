import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { OnEvent } from '@nestjs/event-emitter';
import { DiscordService } from '../discord.service';
import { TextChannel } from 'discord.js';
import { DiscordStartTypingEvent } from '../events/discord-start-typing/discord-start-typing.event';
import delay from 'delay';
import ms from 'ms';

@Injectable()
export class AfterDiscordStartTypingConsumer {
  constructor(
    private discord: DiscordService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @OnEvent(DiscordStartTypingEvent.EVENT_NAME)
  async afterStartTyping(event: DiscordStartTypingEvent) {
    const channel = await this.discord.channels.fetch(event.payload.channelId);

    await this.cacheManager.set(
      `typing-${event.payload.channelId}`,
      true,
      ms('1m'),
    );

    if (!channel.isTextBased()) return;

    const textChannel = channel as unknown as TextChannel;

    while (await this.cacheManager.get(`typing-${event.payload.channelId}`)) {
      await textChannel.sendTyping();
      await delay(ms('9.5s'));
    }
  }
}
