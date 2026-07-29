import * as v from "valibot";
import {
	createApiSchema,
	createResponseSchema,
} from "../utils/schema-transform.js";
import {
	BookingFileDocumentInputSchema,
	BookingFileResponseSchema,
	BookingFinancialInfoInputSchema,
	PassengerDetailPatchInputSchema,
	SelectedPackageDetailInputSchema,
	SelectedServiceDetailInputSchema,
	StatisticCodesInputSchema,
} from "./booking-file.js";
import {
	BoolishSchema,
	createBookingApiSchema,
	SetFileStatusValueSchema,
} from "./booking-shared.js";
import { RsStatusSchema } from "./common.js";

/** Response with RsStatus only (Cancel / ModHeader) */
export const BookingStatusOnlyResponseSchema = createResponseSchema(
	v.object({ RsStatus: RsStatusSchema }),
);

/**
 * Shared with CreateBookingFile — typed BookingFileDetail (+ optional cancel extras).
 * Create / ModServices / SetStatus / SetStatusService all use this shape.
 */
export const BookingFileDetailResponseSchema = BookingFileResponseSchema;

// ---------------------------------------------------------------------------
// ModBookingFileServices — ModFileServicesRQ
// ---------------------------------------------------------------------------

const ModDeadlineDetailInputSchema = v.object({
	reschedulingCode: v.string(),
	description: v.optional(v.string()),
	expireDate: v.optional(v.string()),
});

export const CancellableBookedServiceDetailInputSchema = v.object({
	cancelOperationType: v.union([v.literal("NULLIFY"), v.literal("DELETE")]),
	serviceRefType: v.union([v.literal("RPH"), v.literal("FILE")]),
	serviceRefValue: v.string(),
});

/**
 * ModFileServicesRQ body (camelCase).
 * Add/replace services, assign package, and/or cancel cost lines.
 *
 * Note: SelectedServiceList shape differs from CreateBookingFile —
 * Create uses `{ selectedServiceDetail: one }[]`;
 * Mod uses `{ selectedServiceDetail: one[] }` (AVES wire).
 */
export const ModFileServicesSchema = v.object({
	customerRecordCode: v.string(),
	bookingFileCode: v.string(),
	currencyCode: v.optional(v.string()),
	deadlineList: v.optional(
		v.object({
			deadlineDetail: v.optional(v.array(ModDeadlineDetailInputSchema)),
		}),
	),
	selectedPackageDetail: v.optional(SelectedPackageDetailInputSchema),
	selectedServiceList: v.object({
		selectedServiceDetail: v.pipe(
			v.array(SelectedServiceDetailInputSchema),
			v.minLength(1),
		),
	}),
	cancellableBookedServiceList: v.optional(
		v.object({
			cancellableBookedServiceDetail: v.optional(
				v.array(CancellableBookedServiceDetailInputSchema),
			),
		}),
	),
	passengerList: v.optional(
		v.object({
			passengerDetail: v.optional(v.array(PassengerDetailPatchInputSchema)),
		}),
	),
});

export const ModFileServicesApiSchema = createBookingApiSchema(
	ModFileServicesSchema,
);

// ---------------------------------------------------------------------------
// ModBookingFileHeader — ModFileHeaderRQ
// ---------------------------------------------------------------------------

/**
 * ModFileHeaderRQ body (camelCase).
 * Modify header only — no package/costs.
 */
export const ModFileHeaderSchema = v.object({
	bookingFileCode: v.string(),
	bookingFileStartDate: v.string(),
	customerRecordCode: v.string(),
	newCustomerRecordCode: v.optional(v.string()),
	bookingFileReferenceName: v.optional(v.string()),
	travelAgentCode: v.optional(v.string()),
	billingReferenceCode: v.optional(v.string()),
	paymentReferenceCode: v.optional(v.string()),
	cupCode: v.optional(v.string()),
	cigCode: v.optional(v.string()),
	customerPromoterCode: v.optional(v.string()),
	bookingNote: v.optional(v.string()),
	passengerList: v.optional(
		v.object({
			passengerDetail: v.optional(v.array(PassengerDetailPatchInputSchema)),
		}),
	),
	statisticCodes: v.optional(StatisticCodesInputSchema),
	bookingFinancialInfo: v.optional(BookingFinancialInfoInputSchema),
	financialDeadlineList: v.optional(
		v.object({
			deadlineDetail: v.optional(
				v.array(
					v.object({
						reschedulingCode: v.string(),
						expireDate: v.string(),
						totalAmount: v.string(),
					}),
				),
			),
		}),
	),
});

export const ModFileHeaderApiSchema = createApiSchema(ModFileHeaderSchema);

// ---------------------------------------------------------------------------
// CancelBookingFile — CancelFileRQ
// ---------------------------------------------------------------------------

export const CancelFileSchema = v.object({
	bookingFileCode: v.string(),
	customerRecordCode: v.string(),
});

export const CancelFileApiSchema = createApiSchema(CancelFileSchema);

// ---------------------------------------------------------------------------
// SetBookingFileStatus — SetStatusRQ
// ---------------------------------------------------------------------------

const optionedExpirePolicySchema = v.union([
	v.literal("NOT_SET"),
	v.literal("CONSIDER_HOLIDAY"),
	v.literal("CONSIDER_HOLIDAY_AND_SATURDAY"),
]);

/**
 * SetStatusRQ body (camelCase).
 * Change booking file status (incl. CANCELED / NULLIFIED).
 */
export const SetFileStatusSchema = v.object({
	customerRecordCode: v.string(),
	bookingFileCode: v.string(),
	fileStatus: v.object({
		value: SetFileStatusValueSchema,
		expiredDate: v.optional(v.string()),
		optionedFileExpireDatePolicy: v.optional(optionedExpirePolicySchema),
	}),
	backOfficeRequest: v.optional(BoolishSchema),
	bookingFileDocument: v.optional(BookingFileDocumentInputSchema),
	penalty: v.optional(
		v.object({
			apply: v.optional(BoolishSchema),
			specificCode: v.optional(v.string()),
		}),
	),
	simulateCancelAndGetPenaltyAmount: v.optional(BoolishSchema),
});

export const SetFileStatusApiSchema = createApiSchema(SetFileStatusSchema);

// ---------------------------------------------------------------------------
// SetBookingFileServiceStatus — SetStatusServiceRQ
// ---------------------------------------------------------------------------

export const SetFileServiceStatusSchema = v.object({
	customerRecordCode: v.string(),
	bookingFileCode: v.string(),
	bookingServiceRef: v.string(),
	bookingFileServiceStatus: v.literal("NULLIFIED"),
	bookingFileServiceStatusDate: v.optional(v.string()),
});

export const SetFileServiceStatusApiSchema = createApiSchema(
	SetFileServiceStatusSchema,
);
