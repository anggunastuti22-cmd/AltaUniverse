/**
 * A tiny, dependency-free `Result` type for modelling success/failure in pure
 * domain logic without throwing. Foundation utility shared across domains.
 */
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/** Exhaustiveness helper for discriminated unions / switch statements. */
export function assertNever(value: never, message = 'Unexpected value'): never {
  throw new Error(`${message}: ${String(value)}`);
}
