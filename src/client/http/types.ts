import type { Effect } from "effect";
import type { AvesError } from "../../error.js";

export type HttpTextResponse = {
	statusCode: number;
	body: string;
};

export type HttpClientOptions = {
	baseURL: string;
	timeoutMs?: number;
};

export type AvesHttpService = {
	readonly postXml: (
		endpoint: string,
		xmlBody: string,
	) => Effect.Effect<HttpTextResponse, AvesError>;
};
