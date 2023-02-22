import { Module } from '@nestjs/common';
import { AppController } from '../app.controller.js';
import { AppService } from '../app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { DiscordModule } from './discord/discord.module.js';

@Module({
  imports: [PrismaModule, DiscordModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
