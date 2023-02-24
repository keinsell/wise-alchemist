// Event storage module which is intended to receive all events fired in the system from all modules

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EventStorageConsumer } from './event-storage.consumer';

@Module({
  exports: [EventStorageConsumer],
  providers: [EventStorageConsumer],
  imports: [PrismaModule],
})
export class EventStorageModule {}
