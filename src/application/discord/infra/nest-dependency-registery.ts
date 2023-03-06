import { IDependencyRegistryEngine, InstanceOf } from 'discordx';
import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class NestDependencyRegistery implements IDependencyRegistryEngine {
  private readonly services = new Set<unknown>();

  constructor(private readonly injector: ModuleRef) {}

  addService<T>(classType: T): void {
    const instance = this.injector.create(classType as Type<T>);
    this.services.add(instance);
  }

  getAllServices(): Set<unknown> {
    return this.services;
  }

  getService<T>(classType: T): InstanceOf<T> {
    const instance = this.injector.get(classType as Type<T>);

    if (!instance) {
      throw new Error(`Cannot find service of type ${classType}`);
    }

    return instance as InstanceOf<T>;
  }
}
