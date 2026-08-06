import type { XMLRootElementValues } from "../xml/root.js";
import { createRootElement } from "../xml/root.js";
import type { RqHeader } from "./rq-header.js";

/** Fields from an op def needed to wrap the request envelope. */
export type OpEnvelopeDef = {
	requestRoot: XMLRootElementValues;
	bodyKey?: string;
};

/**
 * Wrap validated API body in the op's XML request root + RqHeader.
 */
export function buildOpEnvelope(
	def: OpEnvelopeDef,
	apiBody: Record<string, unknown>,
	rqHeader: RqHeader,
): Record<string, unknown> {
	const payload = def.bodyKey ? { [def.bodyKey]: apiBody } : apiBody;
	return createRootElement(def.requestRoot, {
		RqHeader: rqHeader,
		...payload,
	});
}
