/**
 * Result type for functional error handling
 */
export type Result<T, E = Error> =
	| { success: true; data: T }
	| { success: false; error: E };

/**
 * Creates a successful result
 */
export function ok<T>(data: T): Result<T, never> {
	return { success: true, data };
}

/**
 * Creates an error result
 */
export function err<E>(error: E): Result<never, E> {
	return { success: false, error };
}

export function isOk(statusCode: number): boolean {
	return statusCode === 200;
}
