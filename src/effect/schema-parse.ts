import { Cause, Effect, Exit, Schema } from "effect";
import { type AvesError, validationError } from "../error.js";
import { formatParseError } from "./parse-error.js";

/** Report every invalid field (with its path), not only the first one. */
const parseOptions = { errors: "all" } as const;

export type SafeParseSuccess<T> = { success: true; output: T };
export type SafeParseFailure = {
	success: false;
	issues: readonly [{ message: string }];
	error: Schema.SchemaError;
};
export type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseFailure;

/**
 * Decode unknown input; throw on failure (request-path / test oracle).
 */
export function parse<A, I>(schema: Schema.Codec<A, I>, input: unknown): A {
	return Schema.decodeUnknownSync(schema, parseOptions)(input);
}

/**
 * Soft decode for response path — never throws.
 */
export function safeParse<A, I>(
	schema: Schema.Codec<A, I>,
	input: unknown,
): SafeParseResult<A> {
	const exit = Schema.decodeUnknownExit(schema, parseOptions)(input);
	if (Exit.isSuccess(exit)) return { success: true, output: exit.value };
	// Decoding a service-free Codec fails only with SchemaError; defects re-throw.
	const error = Cause.squash(exit.cause);
	if (!Schema.isSchemaError(error)) throw error;
	return {
		success: false,
		error,
		issues: [{ message: formatParseError(error) }],
	};
}

/**
 * Effect Schema decode → {@link AvesError} validation failure.
 * Shared by transport invoke + response reader.
 */
export function decodeUnknownAves<A, I>(
	schema: Schema.Codec<A, I>,
	input: unknown,
	message = "Validation error",
): Effect.Effect<A, AvesError> {
	return Schema.decodeUnknownEffect(
		schema,
		parseOptions,
	)(input).pipe(
		Effect.mapError((error) =>
			validationError(`${message}: ${formatParseError(error)}`),
		),
	);
}
