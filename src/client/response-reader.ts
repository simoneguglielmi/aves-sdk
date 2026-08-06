import {
	type BaseIssue,
	type BaseSchema,
	safeParse,
} from "valibot";
import {
	AvesError,
	apiError,
	buildDetails,
	validationError,
} from "../error.js";
import type { RsStatus } from "../types.js";
import { err, ok, type Result } from "../utils/result.js";
import { xmlToJson } from "../xml/client.js";

/**
 * Decode XML text → response root → Valibot schema → rsStatus gate.
 */
export function readAvesResponse<T extends { rsStatus: RsStatus }>(
	xmlText: string,
	responseRootKey: string,
	responseSchema: BaseSchema<unknown, T, BaseIssue<unknown>>,
): Result<T, AvesError> {
	const rootElement = xmlToJson(xmlText)[responseRootKey];
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

	return checkRsStatus(parseResult.output);
}

function checkRsStatus<T extends { rsStatus: RsStatus }>(
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
