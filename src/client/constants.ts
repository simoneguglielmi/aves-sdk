/** Max chars of HTTP error body kept on `apiError` messages. */
export const MAX_ERROR_BODY = 4_096;

/** Default request timeout when `timeoutMs` is omitted. */
export const DEFAULT_TIMEOUT_MS = 30_000;

/** Shared POST headers for AVES XML requests (immutable). */
export const XML_POST_HEADERS = {
	"Content-Type": "application/xml",
} as const;
