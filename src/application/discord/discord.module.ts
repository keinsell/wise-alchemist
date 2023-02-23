import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';

@Module({
  imports: [],
  exports: [DiscordService],
  providers: [DiscordService],
})
export class DiscordModule {}
