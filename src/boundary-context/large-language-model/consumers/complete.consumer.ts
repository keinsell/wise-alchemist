import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';

@Processor('completion')
export class CompletionConsumer {
  private readonly logger = new Logger(CompletionConsumer.name);

  @Process('create')
  async handleCompletionCreate() {
    this.logger.log(`received creation request`);
  }
}
