import { Either, left, right } from 'fp-ts/lib/Either';
import { DomainError } from './domain-error';

export abstract class Usecase<REQUEST, RESPONSE> {
  abstract execute(request: REQUEST): Promise<Either<DomainError, RESPONSE>>;
  protected success<T>(result: T): Either<DomainError, T> {
    return right(result);
  }
  protected fail(error: DomainError): Either<DomainError, undefined> {
    return left(error);
  }
}
