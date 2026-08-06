import type { AvesClientOptions } from "../types.js";

export type RqHeaderCredentials = Pick<
	AvesClientOptions,
	"hostID" | "xtoken" | "languageCode"
>;

/** Build the AVES `RqHeader` attrs object for a request envelope. */
export function createRqHeader(credentials: RqHeaderCredentials) {
	return {
		"@HostID": credentials.hostID,
		"@Xtoken": credentials.xtoken,
		"@Interface": "WEB" as const,
		"@UserName": "WEB" as const,
		...(credentials.languageCode && {
			"@LanguageCode": credentials.languageCode,
		}),
	};
}

export type RqHeader = ReturnType<typeof createRqHeader>;
