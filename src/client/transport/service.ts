import { Effect } from "effect";
import { decodeUnknownAves } from "../../effect/schema-parse.js";
import type { AvesError } from "../../error.js";
import { jsonToXml } from "../../xml/client.js";
import { buildOpEnvelope } from "../envelope.js";
import type { AvesHttpService } from "../http/types.js";
import { AVES_OPS, type AvesOp, type OpParams, type OpResult } from "../ops.js";
import { createRqHeader } from "../rq-header.js";
import { readAvesResponseEffect } from "./response-reader.js";
import type {
	AvesTransportService,
	MakeAvesTransportOptions,
	OpInvokers,
} from "./types.js";

/**
 * Re-correlate `invokers[op]` with K.
 * TS widens mapped-table indexing under a generic key to a union of fns
 * (params collapse to `never`); this is the minimal fix.
 */
function callOp<K extends AvesOp>(
	invokers: OpInvokers,
	op: K,
	params: OpParams<K>,
): Effect.Effect<OpResult<K>, AvesError> {
	return (invokers[op] as OpInvokers[K])(params);
}

/** Build an {@link AvesTransportService}. */
export function makeAvesTransport({
	options,
	http,
}: MakeAvesTransportOptions & { http: AvesHttpService }): AvesTransportService {
	const rqHeader = Object.freeze(createRqHeader(options));

	const invoke: AvesTransportService["invoke"] = (def, params) =>
		Effect.gen(function* () {
			const apiBody = yield* decodeUnknownAves(
				def.apiSchema,
				params,
				"Validation error occurred during invoke",
			);
			const envelope = buildOpEnvelope(def, apiBody, rqHeader);
			const xml = yield* http.post(def.endpoint, jsonToXml(envelope));
			return yield* readAvesResponseEffect(
				xml,
				def.responseRoot,
				def.responseSchema,
			);
		});

	// Concrete `AVES_OPS.x` (not `AVES_OPS[op]`) — each entry stays narrowed.
	const ops = {
		search: (params: OpParams<"search">) => invoke(AVES_OPS.search, params),
		upsert: (params: OpParams<"upsert">) => invoke(AVES_OPS.upsert, params),
		create: (params: OpParams<"create">) => invoke(AVES_OPS.create, params),
		updateServices: (params: OpParams<"updateServices">) =>
			invoke(AVES_OPS.updateServices, params),
		updateHeader: (params: OpParams<"updateHeader">) =>
			invoke(AVES_OPS.updateHeader, params),
		cancel: (params: OpParams<"cancel">) => invoke(AVES_OPS.cancel, params),
		setStatus: (params: OpParams<"setStatus">) =>
			invoke(AVES_OPS.setStatus, params),
		setServiceStatus: (params: OpParams<"setServiceStatus">) =>
			invoke(AVES_OPS.setServiceStatus, params),
		addPayments: (params: OpParams<"addPayments">) =>
			invoke(AVES_OPS.addPayments, params),
		searchBookings: (params: OpParams<"searchBookings">) =>
			invoke(AVES_OPS.searchBookings, params),
		exportData: (params: OpParams<"exportData">) =>
			invoke(AVES_OPS.exportData, params),
		searchPackages: (params: OpParams<"searchPackages">) =>
			invoke(AVES_OPS.searchPackages, params),
		searchServices: (params: OpParams<"searchServices">) =>
			invoke(AVES_OPS.searchServices, params),
		get: (params: OpParams<"get">) => invoke(AVES_OPS.get, params),
		commit: (params: OpParams<"commit">) => invoke(AVES_OPS.commit, params),
	} satisfies OpInvokers;

	return {
		languageCode: options.languageCode,
		createRqHeader: () => rqHeader,
		ops,
		invoke,
		invokeOp: (op, params) => callOp(ops, op, params),
	};
}
