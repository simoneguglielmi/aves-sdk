import { Schema } from "effect";
import {
	bookingRefFacades,
	modHeaderFacades,
	modServicesFacades,
	paymentListFacades,
	setServiceStatusFacades,
	setStatusFacades,
} from "../utils/facade-aliases.js";
import {
	coalesceListHead,
	createApiSchema,
	facadeObject,
	mapSchema,
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
	CancelOperationTypeSchema,
	FilePaymentOperationTypeSchema,
	OptionedExpirePolicySchema,
	PaymentTypeSchema,
	ServiceRefTypeSchema,
	SetFileStatusValueSchema,
} from "./booking-shared.js";
import { BoolishSchema, StatusOnlyResponseSchema } from "./common.js";

/** Response with RsStatus only (Cancel / ModHeader) */
export const BookingStatusOnlyResponseSchema = StatusOnlyResponseSchema;

/** Shared booking file identity fields */
export const bookingFileRefEntries = {
	customerRecordCode: Schema.String,
	bookingFileCode: Schema.String,
} as const;

/**
 * Shared with CreateBookingFile — typed BookingFileDetail fields on the root (+ optional cancel extras).
 * Create / ModServices / SetStatus / SetStatusService all use this shape.
 */
export const BookingFileDetailResponseSchema = BookingFileResponseSchema;

// ---------------------------------------------------------------------------
// ModBookingFileServices — ModFileServicesRQ
// ---------------------------------------------------------------------------

const ModDeadlineDetailInputSchema = Schema.Struct({
	reschedulingCode: Schema.String,
	description: Schema.optional(Schema.String),
	expireDate: Schema.optional(Schema.String),
});

export const CancellableBookedServiceDetailInputSchema = Schema.Struct({
	cancelOperationType: CancelOperationTypeSchema,
	serviceRefType: ServiceRefTypeSchema,
	serviceRefValue: Schema.String,
});

/**
 * ModFileServicesRQ body (camelCase).
 * `*List` fields are flat Detail arrays; wire wrap happens in ModFileServicesApiSchema.
 * `selectedPackageList` (len 1) is an alias for `selectedPackageDetail`.
 */
export const ModFileServicesSchema = mapSchema(
	facadeObject(
		{
			...bookingFileRefEntries,
			currencyCode: Schema.optional(Schema.String),
			deadlineList: Schema.optional(Schema.Array(ModDeadlineDetailInputSchema)),
			selectedPackageDetail: Schema.optional(SelectedPackageDetailInputSchema),
			selectedPackageList: Schema.optional(
				Schema.Array(SelectedPackageDetailInputSchema).pipe(Schema.maxItems(1)),
			),
			selectedServiceList: Schema.Array(SelectedServiceDetailInputSchema).pipe(
				Schema.minItems(1),
			),
			cancellableBookedServiceList: Schema.optional(
				Schema.Array(CancellableBookedServiceDetailInputSchema),
			),
			passengerList: Schema.optional(
				Schema.Array(PassengerDetailPatchInputSchema),
			),
		},
		modServicesFacades,
	),
	coalesceListHead("selectedPackageList", "selectedPackageDetail"),
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
export const ModFileHeaderSchema = facadeObject(
	{
		...bookingFileRefEntries,
		bookingFileStartDate: Schema.String,
		newCustomerRecordCode: Schema.optional(Schema.String),
		bookingFileReferenceName: Schema.optional(Schema.String),
		travelAgentCode: Schema.optional(Schema.String),
		billingReferenceCode: Schema.optional(Schema.String),
		paymentReferenceCode: Schema.optional(Schema.String),
		cupCode: Schema.optional(Schema.String),
		cigCode: Schema.optional(Schema.String),
		customerPromoterCode: Schema.optional(Schema.String),
		bookingNote: Schema.optional(Schema.String),
		passengerList: Schema.optional(
			Schema.Array(PassengerDetailPatchInputSchema),
		),
		statisticCodes: Schema.optional(StatisticCodesInputSchema),
		bookingFinancialInfo: Schema.optional(BookingFinancialInfoInputSchema),
		financialDeadlineList: Schema.optional(
			Schema.Array(
				Schema.Struct({
					reschedulingCode: Schema.String,
					expireDate: Schema.String,
					totalAmount: Schema.String,
				}),
			),
		),
	},
	modHeaderFacades,
);

export const ModFileHeaderApiSchema = createApiSchema(
	ModFileHeaderSchema,
	modBookingFileWire,
);

// ---------------------------------------------------------------------------
// CancelBookingFile — CancelFileRQ
// ---------------------------------------------------------------------------

export const CancelFileSchema = facadeObject(
	bookingFileRefEntries,
	bookingRefFacades,
);

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
export const SetFileStatusSchema = facadeObject(
	{
		...bookingFileRefEntries,
		fileStatus: valueFieldSchema(SetFileStatusValueSchema, {
			expiredDate: Schema.optional(Schema.String),
			optionedFileExpireDatePolicy: Schema.optional(OptionedExpirePolicySchema),
		}),
		backOfficeRequest: Schema.optional(BoolishSchema),
		bookingFileDocument: Schema.optional(BookingFileDocumentInputSchema),
		penalty: Schema.optional(
			Schema.Struct({
				apply: Schema.optional(BoolishSchema),
				specificCode: Schema.optional(Schema.String),
			}),
		),
		simulateCancelAndGetPenaltyAmount: Schema.optional(BoolishSchema),
	},
	setStatusFacades,
);

export const SetFileStatusApiSchema = createApiSchema(
	SetFileStatusSchema,
	setFileStatusWire,
);

// ---------------------------------------------------------------------------
// SetBookingFileServiceStatus — SetStatusServiceRQ
// ---------------------------------------------------------------------------

export const SetFileServiceStatusSchema = facadeObject(
	{
		...bookingFileRefEntries,
		bookingServiceRef: Schema.String,
		bookingFileServiceStatus: Schema.Literal("NULLIFIED"),
		bookingFileServiceStatusDate: Schema.optional(Schema.String),
	},
	setServiceStatusFacades,
);

export const SetFileServiceStatusApiSchema = createApiSchema(
	SetFileServiceStatusSchema,
	elementOnlyWire,
);

// ---------------------------------------------------------------------------
// InsertFilePaymentList — FilePaymentListRQ
// ---------------------------------------------------------------------------

export const FilePaymentDetailInputSchema = Schema.Struct({
	paymentDate: Schema.String,
	paymentNote: Schema.optional(Schema.String),
	payerMasterCode: Schema.optional(Schema.String),
	payerName: Schema.optional(Schema.String),
	amount: Schema.String,
	paymentType: PaymentTypeSchema,
});

/**
 * FilePaymentListRQ body (camelCase).
 * `filePaymentList` is a flat Detail array; wire wrap happens in FilePaymentListApiSchema.
 */
const FilePaymentListEntriesSchema = facadeObject(
	{
		bookingFileCode: Schema.optional(Schema.String),
		bookingFileRefCode: Schema.optional(Schema.String),
		paymentUser: Schema.optional(Schema.String),
		enableMultiplePayments: BoolishSchema,
		operationType: FilePaymentOperationTypeSchema,
		filePaymentList: Schema.Array(FilePaymentDetailInputSchema).pipe(
			Schema.minItems(1),
		),
	},
	paymentListFacades,
);

export const FilePaymentListSchema = FilePaymentListEntriesSchema.pipe(
	Schema.filter(
		(input: Schema.Schema.Type<typeof FilePaymentListEntriesSchema>) =>
			Boolean(input.bookingFileCode || input.bookingFileRefCode),
		{ message: () => "bookingFileCode or bookingFileRefCode is required" },
	),
);

export const FilePaymentListApiSchema = createApiSchema(
	FilePaymentListSchema,
	filePaymentListRequestWire,
);
