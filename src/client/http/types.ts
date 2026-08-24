import type { Effect } from "effect";
import type { AvesError } from "../../error.js";

export type HttpClientOptions = {
	baseURL: string;
	timeoutMs?: number;
};

export type AvesHttpService = {
	readonly post: (
		endpoint: string,
		xml: string,
	) => Effect.Effect<string, AvesError>;
};
