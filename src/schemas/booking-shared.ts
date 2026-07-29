import * as v from "valibot";

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
	| Exclude<
			v.InferOutput<typeof BookingFileStatusWireSchema>,
			keyof typeof statusAliasToCanonical
	  >
	| (typeof statusAliasToCanonical)[keyof typeof statusAliasToCanonical];

/** Normalize BOOKEDFILE status wire aliases to canonical SDK values. */
export function canonicalizeBookingFileStatus(
	value: v.InferOutput<typeof BookingFileStatusWireSchema>,
): CanonicalBookingFileStatus {
	if (value in statusAliasToCanonical)
		return statusAliasToCanonical[value as keyof typeof statusAliasToCanonical];
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

/** Payment type codes (Create paymentList + InsertFilePaymentList) */
export const PaymentTypeSchema = v.union([
	v.literal("C"),
	v.literal("B"),
	v.literal("D"),
	v.literal("T"),
	v.literal("P"),
	v.literal("R"),
	v.literal("A"),
	v.literal("H"),
	v.literal("I"),
	v.literal("J"),
	v.literal("K"),
	v.literal("L"),
	v.literal("M"),
	v.literal("N"),
	v.literal("O"),
	v.literal("Q"),
	v.literal("S"),
	v.literal("U"),
	v.literal("V"),
]);
