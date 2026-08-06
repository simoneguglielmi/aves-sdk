import { request } from 'undici';
import {
  AvesError,
  apiError,
  isAbortError,
  isErrorStatus,
  toAvesError,
} from '../error.js';
import { readTextCapped } from '../utils/read-body.js';
import { err, ok, type Result } from '../utils/result.js';
import { createTimeoutSignal } from '../utils/timeout.js';
import { parseUrl } from '../utils/url.js';
import {
  DEFAULT_TIMEOUT_MS,
  MAX_ERROR_BODY,
  XML_POST_HEADERS,
} from './constants.js';
import type { HttpClientOptions, HttpTextResponse } from './types.js';

/**
 * Minimal HTTP client: POST XML, timeout, status/body only.
 * No Valibot, no AVES envelope, no rsStatus.
 */
export class HttpClient {
  private readonly urlByEndpoint = new Map<string, string>();

  constructor(private readonly options: HttpClientOptions) {}

  async postXml(
    endpoint: string,
    xmlBody: string,
  ): Promise<Result<HttpTextResponse, AvesError>> {
    const { signal, clear } = createTimeoutSignal(
      this.options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    );

    try {
      const response = await request(this.resolveUrl(endpoint), {
        method: 'POST',
        headers: XML_POST_HEADERS,
        body: xmlBody,
        signal,
      });
      const errored = isErrorStatus(response.statusCode);
      const body = errored
        ? await readTextCapped(response.body, MAX_ERROR_BODY)
        : await response.body.text();
      if (errored) return err(apiError(body, 'ERROR', response.statusCode));
      return ok({ statusCode: response.statusCode, body });
    } catch (error) {
      if (isAbortError(error))
        return err(apiError('Request timed out', 'TIMEOUT'));
      return err(toAvesError(error, 'Unknown error occurred'));
    } finally {
      clear?.();
    }
  }

  private resolveUrl(endpoint: string): string {
    const cached = this.urlByEndpoint.get(endpoint);
    if (cached) return cached;
    const url = parseUrl(this.options.baseURL, endpoint);
    this.urlByEndpoint.set(endpoint, url);
    return url;
  }
}
