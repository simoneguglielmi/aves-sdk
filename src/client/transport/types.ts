import type { Effect, Schema } from "effect";
import type { AvesError } from "../../error.js";
import type { AvesClientOptions, RsStatus } from "../../types.js";
import type { OpEnvelopeDef } from "../envelope.js";
import type { AvesHttpService } from "../http/types.js";
import type { AvesOp, OpParams, OpResult } from "../ops.js";
import type { RqHeader } from "../rq-header.js";

/** Static op descriptor consumed by {@link AvesTransportService.invoke}. */
export type AvesOpDef<
	A extends object,
	I,
	B extends { rsStatus: RsStatus },
	J = unknown,
> = OpEnvelopeDef & {
	endpoint: string;
	responseRoot: string;
	apiSchema: Schema.Schema<A, I, never>;
	responseSchema: Schema.Schema<B, J, never>;
};

/** Per-op invokers — prefer `transport.ops.create(params)` in domains. */
export type OpInvokers = {
	readonly [K in AvesOp]: (
		params: OpParams<K>,
	) => Effect.Effect<OpResult<K>, AvesError>;
};

export type AvesTransportService = {
	readonly languageCode: string | undefined;
	readonly createRqHeader: () => RqHeader;
	readonly ops: OpInvokers;
	readonly invoke: <A extends object, I, B extends { rsStatus: RsStatus }, J>(
		def: AvesOpDef<A, I, B, J>,
		params: I,
	) => Effect.Effect<B, AvesError>;
};

export type MakeAvesTransportOptions = {
	readonly options: AvesClientOptions;
	readonly http: AvesHttpService;
};
