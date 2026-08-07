import { Either, Effect, Schema } from "effect";
import { decodeUnknownAves } from "../../effect/schema-parse.js";
import { type AvesError, apiError, validationError } from "../../error.js";
import type { RsStatus } from "../../types.js";
import { err, ok, type Result } from "../../utils/result.js";
import { xmlToJson } from "../../xml/client.js";

/** Fail unless `rsStatus.status === "OK"`. */
export function requireRsStatusOk<T extends { rsStatus: RsStatus }>(
	output: T,
): Effect.Effect<T, AvesError> {
	const { rsStatus } = output;
	if (rsStatus.status !== "OK")
		return Effect.fail(
			apiError(
				rsStatus.errorDescription ?? "",
				rsStatus.status,
				rsStatus.errorCode,
			),
		);
	return Effect.succeed(output);
}

/**
 * Decode XML text → response root → Effect Schema → rsStatus gate.
 * Effect-native path used by transport.
 */
export function readAvesResponseEffect<A extends { rsStatus: RsStatus }, I>(
	xmlText: string,
	responseRootKey: string,
	responseSchema: Schema.Schema<A, I, never>,
): Effect.Effect<A, AvesError> {
	return Effect.gen(function* () {
		const rootElement = xmlToJson(xmlText)[responseRootKey];
		if (!rootElement)
			return yield* Effect.fail(
				validationError(
					`Invalid response structure: missing root element '${responseRootKey}'`,
				),
			);

		const decoded = yield* decodeUnknownAves(
			responseSchema,
			rootElement,
			"Invalid response format",
		);
		return yield* requireRsStatusOk(decoded);
	});
}

/**
 * Sync Result wrapper — thin adapter over {@link readAvesResponseEffect}.
 */
export function readAvesResponse<A extends { rsStatus: RsStatus }, I>(
	xmlText: string,
	responseRootKey: string,
	responseSchema: Schema.Schema<A, I, never>,
): Result<A, AvesError> {
	return Effect.runSync(
		Effect.either(
			readAvesResponseEffect(xmlText, responseRootKey, responseSchema),
		).pipe(
			Effect.map(
				Either.match({
					onLeft: (error) => err(error),
					onRight: (data) => ok(data),
				}),
			),
		),
	);
}
