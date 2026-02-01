import { AvesError } from "../error.js";

function buildUrl(baseURL: string, endpoint: string): URL {
	try {
		const base = new URL(baseURL);
		const basePath = base.pathname.endsWith("/")
			? base.pathname.slice(0, -1)
			: base.pathname;
		const combinedPath = basePath + endpoint;

		return new URL(combinedPath, base);
	} catch (error) {
		throw new AvesError(
			"validation",
			`Invalid baseURL: ${error instanceof Error ? error.message : "Invalid URL format"}`,
		);
	}
}

/**
 * Validates and combines baseURL with endpoint
 * @param baseURL - Base URL (must be http:// or https://)
 * @param endpoint - Endpoint path (must start with /)
 * @returns Combined URL string
 * @throws AvesError if URL is invalid or protocol is not http/https
 */
export function parseUrl(baseURL: string, endpoint: string): string {
	if (!endpoint.startsWith("/")) {
		throw new AvesError(
			"validation",
			`Invalid endpoint: endpoint must start with '/' but got '${endpoint}'`,
		);
	}

	const normalizedBaseURL = baseURL.replace(/\/$/, "");

	const url = buildUrl(normalizedBaseURL, endpoint);

	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new AvesError(
			"validation",
			`Invalid protocol: baseURL must use http:// or https:// but got '${url.protocol}'`,
		);
	}

	return url.toString();
}
