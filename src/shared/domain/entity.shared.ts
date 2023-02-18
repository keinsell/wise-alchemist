export class Entity<T> {
  protected properties: T;
  constructor(properties: T) {
    this.properties = properties;
  }
  getSnapshot(): T {
    return this.properties;
  }
}
