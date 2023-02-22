import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.infra.js';

@Module({
  imports: [],
  exports: [PrismaService],
  providers: [PrismaService],
})
export class PrismaModule {}
