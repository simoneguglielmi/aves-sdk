import { camelToPascalKeys, itemShape } from "./case-transform.js";
import type { WireShape } from "./wire-shapes.js";

/** Only naming exception when detailKey is omitted on the shape. */
const DETAIL_KEY_OVERRIDES: Record<string, string> = {
	financialDeadlineList: "deadlineDetail",
};

export function detailKeyFor(listKey: string, shape?: WireShape): string {
	return (
		shape?.detailKey ??
		DETAIL_KEY_OVERRIDES[listKey] ??
		(listKey.endsWith("List")
			? `${listKey.slice(0, -4)}Detail`
			: `${listKey}Detail`)
	);
}

/**
 * Flatten SDK `*List: Item[]` → AVES List/Detail wrappers, driven by `listWrap` on
 * {@link WireShape} children (and nested item children). No global key-name scan.
 */
export function wrapListDetails<T extends object>(
	input: T,
	shape?: WireShape,
): T {
	const walk = (value: unknown, s?: WireShape): unknown => {
		if (Array.isArray(value)) return value.map((item) => walk(item, s));
		if (value === null || typeof value !== "object") return value;

		const out: Record<string, unknown> = {};
		for (const [key, item] of Object.entries(value)) {
			const child = s?.children?.[key];
			if (child?.listWrap && Array.isArray(item)) {
				const detailKey = detailKeyFor(key, child);
				const details = item.map((entry) => walk(entry, itemShape(child)));
				out[key] =
					child.listWrap === "one"
						? details.map((detail) => ({ [detailKey]: detail }))
						: { [detailKey]: details };
				continue;
			}
			out[key] = walk(item, child);
		}
		return out;
	};
	return walk(input, shape) as T;
}

/**
 * Empty paxAssociated [] → "" so XML emits `<PaxAssociated/>`.
 * SDK accepts `string[]` and maps to `{ pax }[]` for the wire.
 */
export function normalizeEmptyPaxAssociated<T>(input: T): T {
	const walk = (node: unknown): unknown => {
		if (node === null || typeof node !== "object") return node;
		if (Array.isArray(node)) return node.map(walk);
		const result: Record<string, unknown> = {};
		for (const [key, val] of Object.entries(node)) {
			if (key === "paxAssociated" && Array.isArray(val)) {
				if (!val.length) {
					result[key] = "";
					continue;
				}
				if (val.every((item) => typeof item === "string")) {
					result[key] = val.map((pax) => ({ pax }));
					continue;
				}
			}
			result[key] = walk(val);
		}
		return result;
	};
	return walk(input) as T;
}

/**
 * camelCase body → shape-driven list wrap → PascalCase / @attrs.
 */
export function toWireBody<T extends object>(input: T, shape: WireShape) {
	return camelToPascalKeys(
		normalizeEmptyPaxAssociated(wrapListDetails(input, shape)),
		shape,
	);
}
