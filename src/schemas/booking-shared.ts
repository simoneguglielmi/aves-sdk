import type { BaseIssue, BaseSchema } from "valibot";
import * as v from "valibot";
import { camelToPascalKeys } from "../utils/case-transform.js";

/** AVES bool-ish wire values */
export const BoolishSchema = v.union([
	v.literal("true"),
	v.literal("false"),
	v.boolean(),
]);

// ---------------------------------------------------------------------------
// Status unions — request base, set extends, response wire + normalize
// ---------------------------------------------------------------------------

/** Canonical statuses accepted on CreateBookingFile */
export const BookingFileStatusRequestSchema = v.union([
	v.literal("QUOTATION"),
	v.literal("WORK_IN_PROGRESS"),
	v.literal("CONFIRMED"),
	v.literal("OPTIONED"),
	v.literal("CANCELED"),
]);

/** SetBookingFileStatus adds NULLIFIED */
export const SetFileStatusValueSchema = v.union([
	v.literal("QUOTATION"),
	v.literal("WORK_IN_PROGRESS"),
	v.literal("CONFIRMED"),
	v.literal("OPTIONED"),
	v.literal("NULLIFIED"),
	v.literal("CANCELED"),
]);

/** Wire aliases seen in BOOKEDFILE responses */
export const BookingFileStatusWireSchema = v.union([
	v.literal("QUOTATION"),
	v.literal("WORK_IN_PROGRESS"),
	v.literal("CONFIRM"),
	v.literal("CONFIRMED"),
	v.literal("OPTION"),
	v.literal("OPTIONED"),
	v.literal("REQUEST"),
	v.literal("REQUESTED"),
	v.literal("NULLIFIED"),
	v.literal("CANCELED"),
]);

const statusAliasToCanonical = {
	CONFIRM: "CONFIRMED",
	OPTION: "OPTIONED",
	REQUESTED: "REQUEST",
} as const;

export type CanonicalBookingFileStatus =
	| "QUOTATION"
	| "WORK_IN_PROGRESS"
	| "CONFIRMED"
	| "OPTIONED"
	| "REQUEST"
	| "NULLIFIED"
	| "CANCELED";

export function canonicalizeBookingFileStatus(
	value: v.InferOutput<typeof BookingFileStatusWireSchema>,
): CanonicalBookingFileStatus {
	if (value in statusAliasToCanonical) {
		return statusAliasToCanonical[
			value as keyof typeof statusAliasToCanonical
		] as CanonicalBookingFileStatus;
	}
	return value as CanonicalBookingFileStatus;
}

// ---------------------------------------------------------------------------
// Service type enums (shared request + response)
// ---------------------------------------------------------------------------

export const AvesServiceTypeSchema = v.union([
	v.literal("TOP"),
	v.literal("TOP_SS"),
	v.literal("ADV"),
	v.literal("GRP"),
	v.literal("OTHER"),
]);

export const ToServiceTypeSchema = v.union([
	v.literal("ACCOMODATION"),
	v.literal("TRANSPORT"),
	v.literal("CHARTER"),
	v.literal("TRANSFER"),
	v.literal("PULLMAN"),
	v.literal("FERRY"),
	v.literal("CRUISE"),
	v.literal("INSURANCE"),
	v.literal("EXTRAFEE"),
	v.literal("PENALTY"),
	v.literal("PROMO"),
	v.literal("OTHER"),
	v.literal("NOT_SET"),
	v.literal("RESIDENCE"),
]);

export const BookedServiceStatusSchema = v.union([
	v.literal("REQUEST"),
	v.literal("ALLOTMENT_REQUEST"),
	v.literal("CONFIRMED_REQUEST"),
	v.literal("CONFIRMED_EXTRA_ALLOTMENT"),
	v.literal("WAITLISTED"),
	v.literal("ALLOTMENT"),
	v.literal("REFUSED"),
	v.literal("NULLIFIED"),
	v.literal("CANCELED"),
	v.literal("MESSAGE"),
]);

// ---------------------------------------------------------------------------
// Booking request transform (Create + Mod share this)
// ---------------------------------------------------------------------------

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
 * camelCase booking body → PascalCase / @attrs for AVES XML.
 * Root startDate/endDate stay elements; nested package dates become attributes.
 */
export function toBookingApiBody<T>(input: T) {
	return camelToPascalKeys(normalizeEmptyPaxAssociated(input), {
		excludeFromAttributePrefix: ["startDate", "endDate"],
		excludeAttributeFromCamelToPascal: ["sCode", "ssCode", "pCode"],
	});
}

/** Pipe a camelCase booking input schema into the shared AVES request transform. */
export function createBookingApiSchema<
	TInput extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(inputSchema: TInput) {
	return v.pipe(inputSchema, v.transform(toBookingApiBody));
}
