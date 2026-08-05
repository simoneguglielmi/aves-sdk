import * as v from "valibot";
import {
	coalesceListHead,
	createApiSchema,
	valueFieldSchema,
} from "../utils/schema-transform.js";
import {
	elementOnlyWire,
	filePaymentListRequestWire,
	modBookingFileWire,
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
	CancelOperationTypeSchema,
	FilePaymentOperationTypeSchema,
	OptionedExpirePolicySchema,
	PaymentTypeSchema,
	ServiceRefTypeSchema,
	SetFileStatusValueSchema,
} from "./booking-shared.js";
import { StatusOnlyResponseSchema } from "./common.js";

/** Response with RsStatus only (Cancel / ModHeader) */
export const BookingStatusOnlyResponseSchema = StatusOnlyResponseSchema;

/** Shared booking file identity fields */
export const bookingFileRefEntries = {
	customerRecordCode: v.string(),
	bookingFileCode: v.string(),
} as const;

/**
 * Shared with CreateBookingFile — typed BookingFileDetail fields on the root (+ optional cancel extras).
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
	cancelOperationType: CancelOperationTypeSchema,
	serviceRefType: ServiceRefTypeSchema,
	serviceRefValue: v.string(),
});

/**
 * ModFileServicesRQ body (camelCase).
 * `*List` fields are flat Detail arrays; wire wrap happens in ModFileServicesApiSchema.
 * `selectedPackageList` (len 1) is an alias for `selectedPackageDetail`.
 */
export const ModFileServicesSchema = v.pipe(
	v.object({
		...bookingFileRefEntries,
		currencyCode: v.optional(v.string()),
		deadlineList: v.optional(v.array(ModDeadlineDetailInputSchema)),
		selectedPackageDetail: v.optional(SelectedPackageDetailInputSchema),
		selectedPackageList: v.optional(
			v.pipe(v.array(SelectedPackageDetailInputSchema), v.maxLength(1)),
		),
		selectedServiceList: v.pipe(
			v.array(SelectedServiceDetailInputSchema),
			v.minLength(1),
		),
		cancellableBookedServiceList: v.optional(
			v.array(CancellableBookedServiceDetailInputSchema),
		),
		passengerList: v.optional(v.array(PassengerDetailPatchInputSchema)),
	}),
	v.transform(coalesceListHead("selectedPackageList", "selectedPackageDetail")),
);

export const ModFileServicesApiSchema = createApiSchema(
	ModFileServicesSchema,
	modBookingFileWire,
);

// ---------------------------------------------------------------------------
// ModBookingFileHeader — ModFileHeaderRQ
// ---------------------------------------------------------------------------

/**
 * ModFileHeaderRQ body (camelCase).
 * Modify header only — no package/costs.
 */
export const ModFileHeaderSchema = v.object({
	...bookingFileRefEntries,
	bookingFileStartDate: v.string(),
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
	modBookingFileWire,
);

// ---------------------------------------------------------------------------
// CancelBookingFile — CancelFileRQ
// ---------------------------------------------------------------------------

export const CancelFileSchema = v.object({
	...bookingFileRefEntries,
});

export const CancelFileApiSchema = createApiSchema(
	CancelFileSchema,
	elementOnlyWire,
);

// ---------------------------------------------------------------------------
// SetBookingFileStatus — SetStatusRQ
// ---------------------------------------------------------------------------

/**
 * SetStatusRQ body (camelCase).
 * Change booking file status (incl. CANCELED / NULLIFIED).
 * `fileStatus` accepts a status string or `{ value, expiredDate?, ... }`.
 */
export const SetFileStatusSchema = v.object({
	...bookingFileRefEntries,
	fileStatus: valueFieldSchema(SetFileStatusValueSchema, {
		expiredDate: v.optional(v.string()),
		optionedFileExpireDatePolicy: v.optional(OptionedExpirePolicySchema),
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
	...bookingFileRefEntries,
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
		operationType: FilePaymentOperationTypeSchema,
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
);
