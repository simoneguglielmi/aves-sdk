import type { ParseResult } from "effect";
import {
	formatParseError,
	isParseError,
} from "./effect/parse-error.js";
import type { RsStatusValue } from "./schemas/enums.js";

export const ERROR_KINDS = {
	VALIDATION: "validation",
	API: "api",
	UNKNOWN: "unknown",
} as const;

export type ErrorKind = (typeof ERROR_KINDS)[keyof typeof ERROR_KINDS];

/**
 * Error thrown by AVES API operations
 */
export class AvesError extends Error {
	constructor(
		readonly kind: ErrorKind,
		message: string,
		readonly status?: RsStatusValue,
		readonly code?: number,
	) {
		super(message);
		this.name = "AvesError";
	}
}

export function validationError(message: string): AvesError {
	return new AvesError(ERROR_KINDS.VALIDATION, message);
}

export function apiError(
	message: string,
	status?: RsStatusValue,
	code?: number,
): AvesError {
	return new AvesError(ERROR_KINDS.API, message, status, code);
}

export function unknownError(message: string): AvesError {
	return new AvesError(ERROR_KINDS.UNKNOWN, message);
}

/** Map unknown thrown values to a typed {@link AvesError}. */
export function toAvesError(error: unknown, defaultMessage: string): AvesError {
	if (error instanceof AvesError) return error;
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

export function isAbortError(error: unknown): boolean {
	return error instanceof Error && error.name === "AbortError";
}

export const isErrorStatus = (statusCode: number) =>
	statusCode < 200 || statusCode > 299;
