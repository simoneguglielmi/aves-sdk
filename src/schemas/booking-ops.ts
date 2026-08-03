import * as v from "valibot";
import {
	FILE_PAYMENT_LIST_KEYS,
	MOD_HEADER_LIST_KEYS,
	MOD_SERVICES_LIST_KEYS,
} from "../utils/booking-transform.js";
import {
	createApiSchema,
	createResponseSchema,
} from "../utils/schema-transform.js";
import {
	bookingFileWire,
	elementOnlyWire,
	filePaymentListRequestWire,
	setFileStatusWire,
} from "../utils/wire-shapes.js";
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
	PaymentTypeSchema,
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
 * `*List` fields are flat Detail arrays; wire wrap happens in ModFileServicesApiSchema.
 */
export const ModFileServicesSchema = v.object({
	customerRecordCode: v.string(),
	bookingFileCode: v.string(),
	currencyCode: v.optional(v.string()),
	deadlineList: v.optional(v.array(ModDeadlineDetailInputSchema)),
	selectedPackageDetail: v.optional(SelectedPackageDetailInputSchema),
	selectedServiceList: v.pipe(
		v.array(SelectedServiceDetailInputSchema),
		v.minLength(1),
	),
	cancellableBookedServiceList: v.optional(
		v.array(CancellableBookedServiceDetailInputSchema),
	),
	passengerList: v.optional(v.array(PassengerDetailPatchInputSchema)),
});

export const ModFileServicesApiSchema = createApiSchema(
	ModFileServicesSchema,
	bookingFileWire,
	{ listKeys: MOD_SERVICES_LIST_KEYS },
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
	passengerList: v.optional(v.array(PassengerDetailPatchInputSchema)),
	statisticCodes: v.optional(StatisticCodesInputSchema),
	bookingFinancialInfo: v.optional(BookingFinancialInfoInputSchema),
	financialDeadlineList: v.optional(
		v.array(
			v.object({
				reschedulingCode: v.string(),
				expireDate: v.string(),
				totalAmount: v.string(),
			}),
		),
	),
});

export const ModFileHeaderApiSchema = createApiSchema(
	ModFileHeaderSchema,
	bookingFileWire,
	{ listKeys: MOD_HEADER_LIST_KEYS },
);

// ---------------------------------------------------------------------------
// CancelBookingFile — CancelFileRQ
// ---------------------------------------------------------------------------

export const CancelFileSchema = v.object({
	bookingFileCode: v.string(),
	customerRecordCode: v.string(),
});

export const CancelFileApiSchema = createApiSchema(
	CancelFileSchema,
	elementOnlyWire,
);

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

export const SetFileStatusApiSchema = createApiSchema(
	SetFileStatusSchema,
	setFileStatusWire,
);

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
	elementOnlyWire,
);

// ---------------------------------------------------------------------------
// InsertFilePaymentList — FilePaymentListRQ
// ---------------------------------------------------------------------------

const filePaymentOperationTypeSchema = v.union([
	v.literal("AbsoluteAmountsInsertion"),
	v.literal("FinalAmountToAchieve"),
	v.literal("FinalAmountToAchieveWithoutControls"),
]);

export const FilePaymentDetailInputSchema = v.object({
	paymentDate: v.string(),
	paymentNote: v.optional(v.string()),
	payerMasterCode: v.optional(v.string()),
	payerName: v.optional(v.string()),
	amount: v.string(),
	paymentType: PaymentTypeSchema,
});

/**
 * FilePaymentListRQ body (camelCase).
 * `filePaymentList` is a flat Detail array; wire wrap happens in FilePaymentListApiSchema.
 */
export const FilePaymentListSchema = v.pipe(
	v.object({
		bookingFileCode: v.optional(v.string()),
		bookingFileRefCode: v.optional(v.string()),
		paymentUser: v.optional(v.string()),
		enableMultiplePayments: BoolishSchema,
		operationType: filePaymentOperationTypeSchema,
		filePaymentList: v.pipe(
			v.array(FilePaymentDetailInputSchema),
			v.minLength(1),
		),
	}),
	v.check(
		(input) => Boolean(input.bookingFileCode || input.bookingFileRefCode),
		"bookingFileCode or bookingFileRefCode is required",
	),
);

export const FilePaymentListApiSchema = createApiSchema(
	FilePaymentListSchema,
	filePaymentListRequestWire,
	{ listKeys: FILE_PAYMENT_LIST_KEYS },
);
