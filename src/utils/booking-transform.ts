import type { BaseSchema } from "valibot";
import * as v from "valibot";
import { camelToPascalKeys } from "./case-transform.js";

/** Only naming exception: financialDeadlineList → deadlineDetail */
const DETAIL_KEY_OVERRIDES: Record<string, string> = {
	financialDeadlineList: "deadlineDetail",
};

function detailKeyFor(listKey: string) {
	return DETAIL_KEY_OVERRIDES[listKey] ?? listKey.replace(/List$/, "Detail");
}

export type BookingListWrapOptions = {
	listKeys: readonly string[];
	/** Create-only: wrap each item as `{ detailKey: item }` instead of `{ detailKey: items }` */
	arrayOfOne?: ReadonlySet<string>;
};

/**
 * Flatten SDK `*List: Detail[]` → AVES List/Detail wrappers.
 * Returns a new object (list values change shape; not the input type).
 */
export function wrapListDetails(
	input: Record<string, unknown>,
	{ listKeys, arrayOfOne }: BookingListWrapOptions,
): Record<string, unknown> {
	const out: Record<string, unknown> = { ...input };
	const one = arrayOfOne ?? new Set<string>();
	for (const listKey of listKeys) {
		const value = out[listKey];
		if (!Array.isArray(value)) continue;
		const detailKey = detailKeyFor(listKey);
		out[listKey] = one.has(listKey)
			? value.map((item) => ({ [detailKey]: item }))
			: { [detailKey]: value };
	}
	return out;
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
 * Empty paxAssociated [] → "" so XML emits `<PaxAssociated/>` instead of omitting the tag.
 */
export function normalizeEmptyPaxAssociated<T>(input: T): T {
	const walk = (node: unknown): unknown => {
		if (node === null || typeof node !== "object") return node;
		if (Array.isArray(node)) return node.map(walk);
		const result: Record<string, unknown> = {};
		for (const [key, val] of Object.entries(node)) {
			if (key === "paxAssociated" && Array.isArray(val) && !val.length) {
				result[key] = "";
				continue;
			}
			result[key] = walk(val);
		}
		return result;
	};
	return walk(input) as T;
}

/**
 * camelCase booking body → list wrap (optional) → PascalCase / @attrs for AVES XML.
 */
export function toBookingApiBody(
	input: Record<string, unknown>,
	wrap?: BookingListWrapOptions,
) {
	const body = wrap ? wrapListDetails(input, wrap) : input;
	return camelToPascalKeys(normalizeEmptyPaxAssociated(body), {
		excludeFromAttributePrefix: ["startDate", "endDate"],
		excludeAttributeFromCamelToPascal: ["sCode", "ssCode", "pCode"],
	});
}

/** Validate camelCase input, then shape to AVES wire (list wrap + PascalCase). */
export function createBookingApiSchema<
	TInput extends BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(inputSchema: TInput, wrap?: BookingListWrapOptions) {
	return v.pipe(
		inputSchema,
		v.transform((input) =>
			toBookingApiBody(input as Record<string, unknown>, wrap),
		),
	);
}
