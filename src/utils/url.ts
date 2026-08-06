import { validationError } from "../error.js";

/**
 * Validates and combines baseURL with endpoint.
 * Preserves any base path (e.g. `/api/v1` + `/test` → `/api/v1/test`).
 *
 * @param baseURL - Base URL (must be http:// or https://)
 * @param endpoint - Endpoint path (must start with /)
 * @returns Combined URL string
 * @throws AvesError if URL is invalid or protocol is not http/https
 */
export function parseUrl(baseURL: string, endpoint: string): string {
	if (!endpoint.startsWith("/"))
		throw validationError(
			`Invalid endpoint: endpoint must start with '/' but got '${endpoint}'`,
		);

	let base: URL;
	try {
		base = new URL(baseURL);
	} catch (error) {
		throw validationError(
			`Invalid baseURL: ${error instanceof Error ? error.message : "Invalid URL format"}`,
		);
	}

	if (base.protocol !== "http:" && base.protocol !== "https:")
		throw validationError(
			`Invalid protocol: baseURL must use http:// or https:// but got '${base.protocol}'`,
		);

	// Absolute-path endpoint replaces pathname; append when base already has a path.
	const { pathname } = base;
	if (pathname === "/" || pathname === "") return new URL(endpoint, base).href;

	const path = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
	const fullPath = path + endpoint;
	return new URL(fullPath, base).href;
}
