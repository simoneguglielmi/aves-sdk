import type { InferOutput } from "../effect/infer.js";
import {
	BookingFileStatusSchema,
	BookingFileStatusWire,
	type BookingFileStatusWireSchema,
} from "./enums.js";

export {
	AvesServiceType,
	AvesServiceTypeSchema,
	BookedServiceStatus,
	BookedServiceStatusSchema,
	BookingFileStatus,
	BookingFileStatusSchema,
	BookingFileStatusWire,
	BookingFileStatusWireSchema,
	CancelOperationType,
	CancelOperationTypeSchema,
	CostPriceType,
	CostPriceTypeSchema,
	CustomerPaymentType,
	CustomerPaymentTypeSchema,
	DocumentType,
	DocumentTypeSchema,
	FilePaymentOperationType,
	FilePaymentOperationTypeSchema,
	Gender,
	GenderSchema,
	GroupingPaxPolicy,
	GroupingPaxPolicySchema,
	MakeDocumentTo,
	MakeDocumentToSchema,
	OptionedExpirePolicy,
	OptionedExpirePolicySchema,
	PassengerCategory,
	PassengerCategorySchema,
	PaymentType,
	PaymentTypeSchema,
	ServiceRefType,
	ServiceRefTypeSchema,
	SetFileStatusValue,
	SetFileStatusValueSchema,
	ToServiceType,
	ToServiceTypeSchema,
	TypeDownloadFile,
	TypeDownloadFileSchema,
} from "./enums.js";

/** @deprecated Use {@link BookingFileStatusSchema} */
export const BookingFileStatusRequestSchema = BookingFileStatusSchema;

const statusAliasToCanonical = {
	[BookingFileStatusWire.CONFIRM]: "CONFIRMED",
	[BookingFileStatusWire.OPTION]: "OPTIONED",
	[BookingFileStatusWire.REQUESTED]: "REQUEST",
} as const;

export type CanonicalBookingFileStatus =
	| Exclude<
			InferOutput<typeof BookingFileStatusWireSchema>,
			keyof typeof statusAliasToCanonical
	  >
	| (typeof statusAliasToCanonical)[keyof typeof statusAliasToCanonical];

/** Normalize BOOKEDFILE status wire aliases to canonical SDK values. */
export function canonicalizeBookingFileStatus(
	value: InferOutput<typeof BookingFileStatusWireSchema>,
): CanonicalBookingFileStatus {
	if (value in statusAliasToCanonical)
		return statusAliasToCanonical[value as keyof typeof statusAliasToCanonical];
	return value as CanonicalBookingFileStatus;
}
