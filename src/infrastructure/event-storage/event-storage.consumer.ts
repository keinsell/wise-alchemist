import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DomainEvent } from 'src/shared/domain-event';
import { PrismaService } from '../prisma/prisma.infra';

@Injectable()
export class EventStorageConsumer {
  private logger = new Logger(EventStorageConsumer.name);

  constructor(private prisma: PrismaService) {}

  @OnEvent('**')
  async saveEventInDatabase(event: DomainEvent<any>) {
    const savedEvent = await this.prisma.event.create({
      data: {
        eventName: event.constructor.name,
        payload: event.payload,
        timestamp: event.occuredOn,
      },
    });

    this.logger.verbose(
      `Event #${savedEvent.id} ${
        savedEvent.eventName
      } saved with payload ${JSON.stringify(savedEvent.payload)}`,
    );
  }
}
