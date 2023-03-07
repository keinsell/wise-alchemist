import { Injectable, Logger, LoggerService } from '@nestjs/common';
import logdna from '@logdna/logger';

@Injectable()
export class MezmoLogger implements LoggerService {
  private logger: any;
  private consoleLogger = new Logger();

  constructor() {
    this.logger = logdna.createLogger(process.env.LOGDNA_KEY);
  }

  log(message: string) {
    this.logger.log(message);
    this.consoleLogger.log(message);
  }

  error(message: string, trace: string) {
    this.logger.error(message, { trace });
    this.consoleLogger.error(message, trace);
  }

  warn(message: string) {
    this.logger.warn(message);
    this.consoleLogger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
    this.consoleLogger.debug(message);
  }

  verbose(message: string) {
    this.logger.trace(message);
    this.consoleLogger.verbose(message);
  }
}
