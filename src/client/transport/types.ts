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

/**
 * Per-op invokers. Mapped so `ops.create(params)` is fully typed;
 * generic `ops[op]` needs {@link callOp} to re-correlate K.
 */
export type OpInvokers = {
	readonly [K in AvesOp]: (
		params: OpParams<K>,
	) => Effect.Effect<OpResult<K>, AvesError>;
};

export type AvesTransportService = {
	readonly languageCode: string | undefined;
	readonly createRqHeader: () => RqHeader;
	/** Typed table — prefer `transport.ops.create(params)` in domains. */
	readonly ops: OpInvokers;
	readonly invoke: <A extends object, I, B extends { rsStatus: RsStatus }, J>(
		def: AvesOpDef<A, I, B, J>,
		params: I,
	) => Effect.Effect<B, AvesError>;
	readonly invokeOp: <K extends AvesOp>(
		op: K,
		params: OpParams<K>,
	) => Effect.Effect<OpResult<K>, AvesError>;
};

export type MakeAvesTransportOptions = {
	readonly options: AvesClientOptions;
	readonly http: AvesHttpService;
};
