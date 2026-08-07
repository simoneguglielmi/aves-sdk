import {
  FetchHttpClient,
  HttpBody,
  HttpClient,
  type HttpClientError,
  HttpClientRequest,
  HttpClientResponse,
} from '@effect/platform';
import { Duration, Effect, Layer } from 'effect';
import { AvesError, apiError, isErrorStatus } from '../../error.js';
import { DEFAULT_TIMEOUT_MS, MAX_ERROR_BODY } from '../constants.js';
import type {
  AvesHttpService,
  HttpClientOptions,
  HttpTextResponse,
} from './types.js';

const timedOut = apiError('Request timed out', 'TIMEOUT');

const toAvesHttpError = (
  error: AvesError | HttpClientError.HttpClientError,
): AvesError =>
  error instanceof AvesError ? error : apiError(error.message, 'ERROR');

const flattenResponse = (response: HttpClientResponse.HttpClientResponse) => {
  return response.text.pipe(
    Effect.mapError(toAvesHttpError),
    Effect.flatMap((body) => {
      const statusCode = response.status;
      if (isErrorStatus(statusCode))
        return Effect.fail(
          apiError(body.slice(0, MAX_ERROR_BODY), 'ERROR', statusCode),
        );
      return Effect.succeed({
        statusCode,
        body,
      } satisfies HttpTextResponse);
    }),
  );
};

/** Map platform {@link HttpClient} into the AVES XML POST surface. */
export function makeAvesHttp(
  options: HttpClientOptions,
  http: HttpClient.HttpClient,
): AvesHttpService {
  const timeout = Duration.millis(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const client = http.pipe(
    HttpClient.mapRequest(HttpClientRequest.prependUrl(options.baseURL)),
  );
  const xmlPost = (endpoint: string, xmlBody: string) =>
    client.post(endpoint, {
      body: HttpBody.text(xmlBody, 'application/xml'),
    });

  return {
    postXml: (endpoint, xmlBody) =>
      xmlPost(endpoint, xmlBody).pipe(
        Effect.timeoutFail({
          duration: timeout,
          onTimeout: () => timedOut,
        }),
        Effect.mapError(toAvesHttpError),
        Effect.andThen(flattenResponse),
      ),
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
