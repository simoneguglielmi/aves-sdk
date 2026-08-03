import { camelToPascalKeys } from "./case-transform.js";
import type { WireShape } from "./wire-shapes.js";

/** Only naming exception: financialDeadlineList → deadlineDetail */
const DETAIL_KEY_OVERRIDES: Record<string, string> = {
	financialDeadlineList: "deadlineDetail",
};

function detailKeyFor(listKey: string) {
	return DETAIL_KEY_OVERRIDES[listKey] ?? listKey.replace(/List$/, "Detail");
}

export type ListWrapOptions = {
	listKeys: readonly string[];
	/** Create-only: wrap each item as `{ detailKey: item }` instead of `{ detailKey: items }` */
	arrayOfOne?: ReadonlySet<string>;
};

/**
 * Flatten SDK `*List: Detail[]` → AVES List/Detail wrappers.
 * Returns a new object (list values change shape; not the input type).
 */
export function wrapListDetails<T extends object>(
	input: T,
	{ listKeys, arrayOfOne }: ListWrapOptions,
): T {
	const wrapped = { ...input };
	const one = arrayOfOne ?? new Set<string>();
	for (const listKey of listKeys) {
		const value = Reflect.get(wrapped, listKey);
		if (!Array.isArray(value)) continue;
		const detailKey = detailKeyFor(listKey);
		Reflect.set(
			wrapped,
			listKey,
			one.has(listKey)
				? value.map((item) => ({ [detailKey]: item }))
				: { [detailKey]: value },
		);
	}
	return wrapped;
}

export const CREATE_BOOKING_LIST_KEYS = [
	"selectedServiceList",
	"passengerList",
	"selectedPackageList",
	"extraQuoteServiceList",
	"deadlineList",
	"financialDeadlineList",
	"paymentList",
	"noteList",
] as const;

export const CREATE_ARRAY_OF_ONE = new Set([
	"selectedServiceList",
	"passengerList",
]);

export const MOD_SERVICES_LIST_KEYS = [
	"selectedServiceList",
	"passengerList",
	"cancellableBookedServiceList",
	"deadlineList",
] as const;

export const MOD_HEADER_LIST_KEYS = [
	"passengerList",
	"financialDeadlineList",
] as const;

export const FILE_PAYMENT_LIST_KEYS = ["filePaymentList"] as const;

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
 * camelCase body → optional list wrap → PascalCase / @attrs via required wire shape.
 */
export function toWireBody<T extends object>(
	input: T,
	shape: WireShape,
	wrap?: ListWrapOptions,
) {
	const body = wrap ? wrapListDetails(input, wrap) : input;
	return camelToPascalKeys(normalizeEmptyPaxAssociated(body), shape);
}
