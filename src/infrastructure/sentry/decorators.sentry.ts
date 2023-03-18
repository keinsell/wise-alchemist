import { TransactionContext } from '@sentry/types';
import { startTransaction } from '@sentry/node';

export function SentryCreateTransaction(context: TransactionContext) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const generationTransaction = startTransaction(context);
      const output = originalMethod.apply(this, args);
      generationTransaction.finish();
      return output;
    };

    return descriptor;
  };
}
