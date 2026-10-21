import { validationError } from "../../error.js";

const NUMERIC_STRING = /^\d+(\.\d+)?$/;

/**
 * `timeoutMs` as a positive number of milliseconds, checked when the client is built.
 * A numeric string (typically read from an env var) is accepted, as `setTimeout` did
 * before 5.0: Effect's `Duration.millis` reads a string as nanoseconds and NaN or a
 * negative value as 0, so every request would time out at once.
 */
export function resolveTimeoutMs(value: unknown): number | undefined {
	if (value === undefined) return undefined;
	const ms =
		typeof value === "string" && NUMERIC_STRING.test(value.trim())
			? Number(value)
			: value;
	if (typeof ms === "number" && Number.isFinite(ms) && ms > 0) return ms;
	throw validationError(
		`Invalid timeoutMs: expected a positive number of milliseconds, received ${typeof value} ${String(value)}`,
	);
}
