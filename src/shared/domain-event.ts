export class DomainEvent<T> {
  readonly occuredOn: Date;
  readonly payload: T;

  constructor(payload: T) {
    this.occuredOn = new Date();
    this.payload = payload;
  }
}
