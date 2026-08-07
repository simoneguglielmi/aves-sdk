import { Data, type ParseResult, Predicate } from "effect";
import { formatParseError, isParseError } from "./effect/parse-error.js";
import type { RsStatusValue } from "./schemas/enums.js";

export const ERROR_KINDS = {
	VALIDATION: "validation",
	API: "api",
	UNKNOWN: "unknown",
} as const;

export type ErrorKind = (typeof ERROR_KINDS)[keyof typeof ERROR_KINDS];

/** Request/response Schema decode failure — `catchTag("AvesValidationError")`. */
export class AvesValidationError extends Data.TaggedError(
	"AvesValidationError",
)<{
	readonly message: string;
	readonly status?: undefined;
	readonly code?: undefined;
}> {
	readonly kind = ERROR_KINDS.VALIDATION;
}

/** AVES `rsStatus` / HTTP failure — `catchTag("AvesApiError")`. */
export class AvesApiError extends Data.TaggedError("AvesApiError")<{
	readonly message: string;
	readonly status?: RsStatusValue;
	readonly code?: number;
}> {
	readonly kind = ERROR_KINDS.API;
}

/** Unexpected defect — `catchTag("AvesUnknownError")`. */
export class AvesUnknownError extends Data.TaggedError("AvesUnknownError")<{
	readonly message: string;
	readonly status?: undefined;
	readonly code?: undefined;
}> {
	readonly kind = ERROR_KINDS.UNKNOWN;
}

/** Discriminated union of AVES failures (Effect + Promise facade). */
export type AvesError = AvesValidationError | AvesApiError | AvesUnknownError;

export const isAvesError = (u: unknown): u is AvesError =>
	Predicate.isTagged(u, "AvesValidationError") ||
	Predicate.isTagged(u, "AvesApiError") ||
	Predicate.isTagged(u, "AvesUnknownError");

export function validationError(message: string): AvesValidationError {
	return new AvesValidationError({ message });
}

export function apiError(
	message: string,
	status?: RsStatusValue,
	code?: number,
): AvesApiError {
	return new AvesApiError({ message, status, code });
}

export function unknownError(message: string): AvesUnknownError {
	return new AvesUnknownError({ message });
}

/** Map unknown thrown values to a typed {@link AvesError}. */
export function toAvesError(error: unknown, defaultMessage: string): AvesError {
	if (isAvesError(error)) return error;
	if (isParseError(error))
		return validationError(`Validation error: ${formatParseError(error)}`);
	if (error instanceof Error) {
		if (error.name === "ParseError")
			return validationError(`Validation error: ${error.message}`);
		return unknownError(error.message);
	}
	return unknownError(defaultMessage);
}

/** Format issue lists or ParseError for response-reader messages. */
export function buildDetails(
	issues: readonly { message?: string }[] | ParseResult.ParseError,
): string {
	if (isParseError(issues)) return formatParseError(issues);
	if (Array.isArray(issues))
		return issues.map((i) => i.message ?? "Invalid value").join("; ");
	return String(issues);
}

export const isErrorStatus = (statusCode: number) =>
	statusCode < 200 || statusCode > 299;
