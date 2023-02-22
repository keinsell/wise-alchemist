import { INestApplication } from '@nestjs/common';
import { IDependencyRegistryEngine, InstanceOf } from 'discordx';

export class NestjsDependencyRegistryEngine
  implements IDependencyRegistryEngine
{
  private injector: INestApplication;

  constructor(injector: INestApplication) {
    this.injector = injector;
  }

  addService<T>(classType: T): void {
    // throw new Error('Method not implemented.');
  }
  getAllServices(): Set<unknown> {
    // throw new Error('Method not implemented.');
    return;
  }
  getService<T>(classType: T): InstanceOf<T> {
    return this.injector.get(classType as any);
  }
  static setContainer(container: INestApplication) {
    return new NestjsDependencyRegistryEngine(container);
  }
}
