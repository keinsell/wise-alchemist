import { Module } from '@nestjs/common';
import { MezmoLogger } from './mezmo-logger-service';

@Module({
  providers: [
    {
      provide: MezmoLogger,
      useFactory: () => new MezmoLogger(),
    },
  ],
  exports: [MezmoLogger],
})
export class MezmoLoggerModule {}
