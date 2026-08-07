/**
 * Client module layout (Effect services):
 *
 *   config/     tag + layer
 *   http/       types + tag + service + layer
 *   transport/  types + tag + service + layer + response-reader
 *   booking/    types + tag + service + layer
 *   master/     types + tag + service + layer
 *   packages/   types + tag + service + layer
 *   layer.ts    app composition (avesClientLayer)
 *   ops.ts      AVES_OPS registry
 *   endpoints, envelope, rq-header, constants
 */

export * from "./booking/index.js";
export * from "./config/index.js";
export * from "./http/index.js";
export * from "./layer.js";
export * from "./master/index.js";
export {
	AvesOp,
	AvesOpSchema,
	type OpParams,
	type OpResult,
} from "./ops.js";
export * from "./packages/index.js";
export * from "./transport/index.js";
export type { AvesClientDeps } from "./types.js";
