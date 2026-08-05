/**
 * Result type for functional error handling.
 */
interface Success<T> {
  success: true;
  data: T;
}

/**
 * Result type for functional error handling.
 */
interface Failure<E extends Error> {
  success: false;
  error: E;
}

/**
 * Result type for functional error handling.
 */
export type Result<T, E extends Error = Error> = Success<T> | Failure<E>;

/**
 * Creates a successful result.
 */
export function ok<T>(data: T): Success<T> {
  return { success: true, data };
}

/**
 * Creates an error result.
 */
export function err<E extends Error>(error: E): Failure<E> {
  return { success: false, error };
}
