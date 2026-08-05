import { request as r } from "undici";
import {
	type BaseIssue,
	type BaseSchema,
	parse,
	safeParse,
	ValiError,
} from "valibot";
import {
	AvesError,
	apiError,
	buildDetails,
	isAbortError,
	unknownError,
	validationError,
} from "../error.js";
import type { AvesClientOptions, RsStatus } from "../types.js";
import { err, ok, type Result } from "../utils/result.js";
import { createTimeoutSignal } from "../utils/timeout.js";
import { parseUrl } from "../utils/url.js";
import { jsonToXml, xmlToJson } from "../xml/client.js";
import { createRootElement, type XMLRootElementValues } from "../xml/root.js";

const MAX_ERROR_BODY = 4_096;

/**
 * Shared HTTP + XML transport for AVES domain clients.
 */
export class AvesTransport {
	constructor(private readonly options: AvesClientOptions) {}

	get languageCode() {
		return this.options.languageCode;
	}

	createRqHeader() {
		return {
			"@HostID": this.options.hostID,
			"@Xtoken": this.options.xtoken,
			"@Interface": "WEB" as const,
			"@UserName": "WEB" as const,
			...(this.options.languageCode && {
				"@LanguageCode": this.options.languageCode,
			}),
		};
	}

	toAvesError(error: unknown, defaultMessage: string): AvesError {
		if (error instanceof AvesError) return error;
		if (error instanceof ValiError)
			return validationError(`Validation error: ${buildDetails(error.issues)}`);
		if (error instanceof Error) return unknownError(error.message);
		return unknownError(defaultMessage);
	}

	private handleApiStatus<T extends { rsStatus: RsStatus }>(
		output: T,
	): Result<T, AvesError> {
		const { rsStatus } = output;
		if (rsStatus.status !== "OK")
			return err(
				apiError(
					rsStatus.errorDescription ?? "",
					rsStatus.status,
					rsStatus.errorCode,
				),
			);
		return ok(output);
	}

	private async request<T extends { rsStatus: RsStatus }>(
		endpoint: string,
		requestBody: Record<string, unknown>,
		responseRootKey: string,
		responseSchema: BaseSchema<unknown, T, BaseIssue<unknown>>,
	): Promise<Result<T, AvesError>> {
		const { signal, clear } = createTimeoutSignal(
			this.options.timeoutMs ?? 30_000,
		);

		try {
			const response = await r(parseUrl(this.options.baseURL, endpoint), {
				method: "POST",
				headers: { "Content-Type": "application/xml" },
				body: jsonToXml(requestBody),
				signal,
			});

			const responseText = await response.body.text();
			if (response.statusCode < 200 || response.statusCode > 299)
				return err(
					apiError(
						responseText.slice(0, MAX_ERROR_BODY),
						"ERROR",
						response.statusCode,
					),
				);

			const rootElement = xmlToJson(responseText)[responseRootKey];
			if (!rootElement)
				return err(
					validationError(
						`Invalid response structure: missing root element '${responseRootKey}'`,
					),
				);

			const parseResult = safeParse(responseSchema, rootElement);
			if (!parseResult.success)
				return err(
					validationError(
						`Invalid response format: ${buildDetails(parseResult.issues)}`,
					),
				);
			return this.handleApiStatus(parseResult.output);
		} catch (error) {
			if (isAbortError(error))
				return err(apiError("Request timed out", "TIMEOUT"));
			return err(this.toAvesError(error, "Unknown error occurred"));
		} finally {
			clear?.();
		}
	}

	/** Validate → wrap RqHeader → POST → parse response. */
	async invokeOp<
		TIn,
		TApiBody extends Record<string, unknown>,
		TOut extends { rsStatus: RsStatus },
	>(opts: {
		op: string;
		params: TIn;
		apiSchema: BaseSchema<TIn, TApiBody, BaseIssue<unknown>>;
		endpoint: string;
		requestRoot: XMLRootElementValues;
		responseRoot: string;
		responseSchema: BaseSchema<unknown, TOut, BaseIssue<unknown>>;
		/** Nest parsed body under this key instead of spreading at RQ root. */
		bodyKey?: string;
	}): Promise<Result<TOut, AvesError>> {
		try {
			const apiBody = parse(opts.apiSchema, opts.params);
			const payload = opts.bodyKey ? { [opts.bodyKey]: apiBody } : apiBody;
			return this.request(
				opts.endpoint,
				createRootElement(opts.requestRoot, {
					RqHeader: this.createRqHeader(),
					...payload,
				}),
				opts.responseRoot,
				opts.responseSchema,
			);
		} catch (error) {
			return err(
				this.toAvesError(error, `Validation error occurred during ${opts.op}`),
			);
		}
	}
}
