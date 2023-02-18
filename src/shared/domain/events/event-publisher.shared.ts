export abstract class EventPublisher<T> {
  abstract publish(event: T): Promise<void>;
}
