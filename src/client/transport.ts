import { parse } from "valibot";
import { AvesError, toAvesError } from "../error.js";
import type { AvesClientOptions } from "../types.js";
import { err, type Result } from "../utils/result.js";
import { jsonToXml } from "../xml/client.js";
import { buildOpEnvelope } from "./envelope.js";
import { HttpClient } from "./http-client.js";
import { AVES_OPS, type AvesOp, type OpParams, type OpResult } from "./ops.js";
import { readAvesResponse } from "./response-reader.js";
import { createRqHeader, type RqHeader } from "./rq-header.js";

/**
 * Orchestrates AVES ops: validate → envelope → HTTP → response reader.
 */
export class AvesTransport {
	private readonly http: HttpClient;
	private readonly rqHeader: RqHeader;

	constructor(private readonly options: AvesClientOptions) {
		this.http = new HttpClient({
			baseURL: options.baseURL,
			timeoutMs: options.timeoutMs,
		});
		this.rqHeader = Object.freeze(createRqHeader(options));
	}

	get languageCode() {
		return this.options.languageCode;
	}

	createRqHeader() {
		return this.rqHeader;
	}

	/**
	 * Validate → wrap RqHeader → POST → parse response.
	 * Static endpoint / roots / schemas come from {@link AVES_OPS}.
	 */
	async invokeOp<K extends AvesOp>(
		op: K,
		params: OpParams<K>,
	): Promise<Result<OpResult<K>, AvesError>> {
		const def = AVES_OPS[op];
		try {
			const apiBody = parse(def.apiSchema, params);
			const envelope = buildOpEnvelope(def, apiBody, this.rqHeader);
			const httpResult = await this.http.postXml(
				def.endpoint,
				jsonToXml(envelope),
			);
			if (!httpResult.success) return httpResult;
			return readAvesResponse(
				httpResult.data.body,
				def.responseRoot,
				def.responseSchema,
			);
		} catch (error) {
			return err(
				toAvesError(error, `Validation error occurred during ${op}`),
			);
		}
	}
}
