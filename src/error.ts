import type { BaseIssue } from "valibot";

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
		public readonly kind: ErrorKind,
		public readonly message: string,
		public readonly status?: string,
		public readonly code?: number | string,
	) {
		super(message);
		this.name = "AvesError";
		this.status = status?.toLowerCase();
		this.code = this.parseCode(code);
	}

	private parseCode(code?: number | string): number {
		if (typeof code === "string") {
			return Number.parseInt(code, 10);
		}
		return code ?? 0;
	}
}

export function validationError(message: string): AvesError {
	return new AvesError(ERROR_KINDS.VALIDATION, message);
}

export function apiError(
	message: string,
	status?: string,
	code?: number | string,
): AvesError {
	return new AvesError(ERROR_KINDS.API, message, status, code);
}

export function unknownError(message: string): AvesError {
	return new AvesError(ERROR_KINDS.UNKNOWN, message);
}

export function buildDetails(issues: readonly BaseIssue<unknown>[]): string {
	return issues.map(formatIssue).join("; ");
}

function formatIssue(issue: BaseIssue<unknown>): string {
	const path = formatPath(issue.path);
	const message = issue.message ?? "Invalid value";

	return path ? `${path}: ${message}` : message;
}

function formatPath(path?: readonly unknown[]): string | undefined {
	if (!path || path.length === 0) return;

	const segments = path
		.map(extractSegment)
		.filter((segment): segment is string => segment !== undefined);

	return segments.length > 0 ? segments.join(".") : undefined;
}

function extractSegment(segment: unknown): string | undefined {
	if (typeof segment === "string" || typeof segment === "number") {
		return String(segment);
	}

	if (typeof segment === "object" && segment !== null && "key" in segment) {
		return String(segment.key);
	}

	return;
}

export function isAbortError(error: unknown): boolean {
	return error instanceof Error && error.name === "AbortError";
}
