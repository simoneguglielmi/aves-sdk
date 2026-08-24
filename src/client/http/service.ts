import {
	FetchHttpClient,
	HttpBody,
	HttpClient,
	type HttpClientError,
	HttpClientRequest,
	type HttpClientResponse,
} from "@effect/platform";
import { Duration, Effect, Layer } from "effect";
import {
	type AvesError,
	apiError,
	isAvesError,
	isErrorStatus,
} from "../../error.js";
import { DEFAULT_TIMEOUT_MS, MAX_ERROR_BODY } from "../constants.js";
import type { AvesHttpService, HttpClientOptions } from "./types.js";

const timedOut = apiError("Request timed out", "TIMEOUT");

const toAvesHttpError = (
	error: AvesError | HttpClientError.HttpClientError,
): AvesError => (isAvesError(error) ? error : apiError(error.message, "ERROR"));

/** Decode body text; non-2xx → {@link apiError}. */
const readOkText = (
	response: HttpClientResponse.HttpClientResponse,
): Effect.Effect<string, AvesError> =>
	response.text.pipe(
		Effect.mapError(toAvesHttpError),
		Effect.flatMap((body) => {
			if (isErrorStatus(response.status))
				return Effect.fail(
					apiError(body.slice(0, MAX_ERROR_BODY), "ERROR", response.status),
				);
			return Effect.succeed(body);
		}),
	);

/** Map platform {@link HttpClient} into the AVES XML POST surface. */
export function makeAvesHttp(
	options: HttpClientOptions,
	http: HttpClient.HttpClient,
): AvesHttpService {
	const timeout = Duration.millis(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
	const client = http.pipe(
		HttpClient.mapRequest(HttpClientRequest.prependUrl(options.baseURL)),
		HttpClient.transformResponse((effect) =>
			effect.pipe(
				Effect.timeoutFail({
					duration: timeout,
					onTimeout: () => timedOut,
				}),
				Effect.mapError(toAvesHttpError),
			),
		),
	);

	return {
		/** POST `application/xml` to `endpoint` (relative to `baseURL`). */
		post: (endpoint, xml) =>
			client
				.post(endpoint, { body: HttpBody.text(xml, "application/xml") })
				.pipe(Effect.andThen(readOkText)),
	};
}

/** Default platform HTTP (`globalThis.fetch`). Override via {@link AvesClientDeps.httpClient}. */
export const fetchHttpLayer: Layer.Layer<HttpClient.HttpClient> =
	FetchHttpClient.layer;

export function httpClientLayer(
	httpClient?: HttpClient.HttpClient,
): Layer.Layer<HttpClient.HttpClient> {
	if (!httpClient) return fetchHttpLayer;
	return Layer.succeed(HttpClient.HttpClient, httpClient);
}
