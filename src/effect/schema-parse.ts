import { Either, Effect, type ParseResult, Schema } from "effect";
import { type AvesError, validationError } from "../error.js";
import { formatParseError } from "./parse-error.js";

export type SafeParseSuccess<T> = { success: true; output: T };
export type SafeParseFailure = {
	success: false;
	issues: readonly [{ message: string }];
	error: ParseResult.ParseError;
};
export type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseFailure;

/**
 * Decode unknown input; throw on failure (request-path / test oracle).
 */
export function parse<A, I>(
	schema: Schema.Schema<A, I, never>,
	input: unknown,
): A {
	return Schema.decodeUnknownSync(schema)(input);
}

/**
 * Soft decode for response path — never throws.
 */
export function safeParse<A, I>(
	schema: Schema.Schema<A, I, never>,
	input: unknown,
): SafeParseResult<A> {
	const result = Schema.decodeUnknownEither(schema)(input);
	if (Either.isRight(result)) return { success: true, output: result.right };
	return {
		success: false,
		error: result.left,
		issues: [{ message: formatParseError(result.left) }],
	};
}

/**
 * Effect Schema decode → {@link AvesError} validation failure.
 * Shared by transport invoke + response reader.
 */
export function decodeUnknownAves<A, I>(
	schema: Schema.Schema<A, I, never>,
	input: unknown,
	message = "Validation error",
): Effect.Effect<A, AvesError> {
	return Schema.decodeUnknown(schema)(input).pipe(
		Effect.mapError((error) =>
			validationError(`${message}: ${formatParseError(error)}`),
		),
	);
}
