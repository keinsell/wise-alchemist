import { Either, left, right } from 'fp-ts/lib/Either';
import { Exception } from './domain-error';

export abstract class Usecase<REQUEST, RESPONSE> {
  abstract execute(request: REQUEST): Promise<Either<Exception, RESPONSE>>;
  protected success<T>(result: T): Either<Exception, T> {
    return right(result);
  }
  protected fail(error: Exception): Either<Exception, undefined> {
    return left(error);
  }
}
