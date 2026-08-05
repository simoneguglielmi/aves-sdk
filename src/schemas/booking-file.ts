import * as v from "valibot";
import {
	coalesceCustomerRecordCode,
	createApiSchema,
	createFlattenedResponseSchema,
	valueFieldSchema,
} from "../utils/schema-transform.js";
import { bookingFileWire } from "../utils/wire-shapes.js";
import {
	BookingFileDetailApiSchema,
	PrintableDocumentsListApiSchema,
	TotalAmountDetailApiSchema,
} from "./booking-response.js";
import {
	AvesServiceTypeSchema,
	BookingFileStatusSchema,
	BoolishSchema,
	CostPriceTypeSchema,
	CustomerPaymentTypeSchema,
	DocumentTypeSchema,
	GenderSchema,
	GroupingPaxPolicySchema,
	MakeDocumentToSchema,
	PassengerCategorySchema,
	PaymentTypeSchema,
	ToServiceTypeSchema,
	TypeDownloadFileSchema,
} from "./booking-shared.js";
import { RsStatusSchema } from "./common.js";
import { DestinationTypeSchema } from "./enums.js";
import { IdDocumentDetailInputSchema } from "./master-record.js";

// ---------------------------------------------------------------------------
// BookingFileStatus
// ---------------------------------------------------------------------------

const BookingFileStatusInputSchema = valueFieldSchema(BookingFileStatusSchema, {
	expiredDate: v.optional(v.string()),
});

// ---------------------------------------------------------------------------
// StatisticCodes (AvesStatisticCodes)
// ---------------------------------------------------------------------------

export const StatisticCodesInputSchema = v.object({
	sCode1: v.optional(v.pipe(v.string(), v.maxLength(4))),
	sCode2: v.optional(v.pipe(v.string(), v.maxLength(4))),
	sCode3: v.optional(v.pipe(v.string(), v.maxLength(4))),
	sCode4: v.optional(v.pipe(v.string(), v.maxLength(4))),
	sCode5: v.optional(v.pipe(v.string(), v.maxLength(4))),
	sCode6: v.optional(v.pipe(v.string(), v.maxLength(4))),
});

// ---------------------------------------------------------------------------
// Destination
// ---------------------------------------------------------------------------

export const DestinationInputSchema = v.object({
	code: v.optional(v.string()),
	iataCode: v.optional(v.string()),
	nationCode: v.optional(v.string()),
	type: v.optional(DestinationTypeSchema),
});

// ---------------------------------------------------------------------------
// CustomerDetail (record code only or full master record data)
// ---------------------------------------------------------------------------

const CustomerDetailInputSchema = v.object({
	recordCode: v.optional(v.string()),
	// When inserting new record, master record fields can be provided (see Common Structures)
});

// ---------------------------------------------------------------------------
// BookingFileDocument
// ---------------------------------------------------------------------------

const ReservationFormCustomizablePrintParametersInputSchema = v.object({
	makeDocumentTo: v.optional(MakeDocumentToSchema),
});

const TravelInformationCustomizablePrintParametersInputSchema = v.object({
	fillInCode: v.optional(v.string()),
});

const DocumentCustomizablePrintParametersInputSchema = v.union([
	ReservationFormCustomizablePrintParametersInputSchema,
	TravelInformationCustomizablePrintParametersInputSchema,
]);

const InfoDocumentToPrintInputSchema = v.object({
	documentType: DocumentTypeSchema,
	documentCustomizablePrintParameters: v.optional(
		DocumentCustomizablePrintParametersInputSchema,
	),
});

export const BookingFileDocumentInputSchema = v.object({
	printDoc: v.optional(BoolishSchema),
	sendDocViaEmail: v.optional(BoolishSchema),
	infoDocumentsToPrint: v.optional(v.array(InfoDocumentToPrintInputSchema)),
});

// ---------------------------------------------------------------------------
// FinancialDeadlineList / DeadlineList / PaymentList
// ---------------------------------------------------------------------------

const FinancialDeadlineDetailInputSchema = v.object({
	reschedulingCode: v.optional(v.string()),
	expireDate: v.optional(v.string()),
	totalAmount: v.optional(v.string()),
});

const DeadlineDetailInputSchema = v.object({
	deadlineCode: v.optional(v.string()),
	description: v.optional(v.string()),
	expireDate: v.optional(v.string()),
});

const PaymentDetailInputSchema = v.object({
	paymentDate: v.optional(v.string()),
	paymentNote: v.optional(v.string()),
	amount: v.optional(v.string()),
	paymentUser: v.optional(v.string()),
	paymentType: v.optional(PaymentTypeSchema),
});

// ---------------------------------------------------------------------------
// SelectedPackageList / SelectedServiceList / ExtraQuoteServiceList
// ---------------------------------------------------------------------------

const NoteDetailInputSchema = v.object({
	nType: v.optional(v.string()),
	title: v.optional(v.string()),
	text: v.optional(v.string()),
});

/** ServiceFare — cost/price of a selected or booked service */
export const ServiceFareInputSchema = v.object({
	currencyCode: v.optional(v.string()),
	exchangeRate: v.optional(v.string()),
	cost: v.optional(v.string()),
	costTax: v.optional(v.string()),
	costType: v.optional(CostPriceTypeSchema),
	vatCostCurrencyCode: v.optional(v.string()),
	price: v.optional(v.string()),
	priceTax: v.optional(v.string()),
	priceType: v.optional(CostPriceTypeSchema),
});

export const AvesServiceInfoInputSchema = v.object({
	packageCode: v.optional(v.string()),
	packageReference: v.optional(v.string()),
	suballotmentCode: v.optional(v.string()),
	priceListCode: v.optional(v.string()),
	costListCode: v.optional(v.string()),
	externalFileCode: v.optional(v.string()),
	externalReference: v.optional(v.string()),
	serviceStatus: v.optional(v.string()),
	serviceStatisticCode: v.optional(v.string()),
	serviceFare: v.optional(ServiceFareInputSchema),
});

export const SelectedServiceDetailInputSchema = v.object({
	sCode: v.string(),
	ssCode: v.optional(v.string()),
	avesServiceType: AvesServiceTypeSchema,
	toServiceType: v.optional(ToServiceTypeSchema),
	subServiceDesc: v.optional(v.string()),
	startDate: v.string(),
	endDate: v.string(),
	qty: v.string(),
	pax: v.string(),
	paxAssociated: v.optional(
		v.union([v.array(v.string()), v.array(v.object({ pax: v.string() }))]),
	),
	avesSession: v.string(),
	avesServiceInfo: v.optional(AvesServiceInfoInputSchema),
	serviceFare: v.optional(ServiceFareInputSchema),
	bookedServiceRef: v.optional(v.string()),
	supplierMasterCode: v.optional(v.string()),
	voucherMasterCode: v.optional(v.string()),
	// Known gaps: AVES service-info variants remain unmodeled raw strings.
	hotelServiceInfo: v.optional(v.string()),
	carRentalServiceInfo: v.optional(v.string()),
	flightServiceInfo: v.optional(v.string()),
	shipServiceInfo: v.optional(v.string()),
	ticketServiceInfo: v.optional(v.string()),
	commission: v.optional(v.string()),
	noteList: v.optional(v.array(NoteDetailInputSchema)),
	// Known gap: AVES voucher info remains an unmodeled raw string.
	voucherInfo: v.optional(v.string()),
	firstDescription: v.optional(v.string()),
	secondDescription: v.optional(v.string()),
});

export const SelectedPackageDetailInputSchema = v.object({
	pCode: v.string(),
	startDate: v.string(),
	endDate: v.string(),
	getServicesFromPackage: v.optional(BoolishSchema),
});

// ---------------------------------------------------------------------------
// PassengerList (PassengerDetail - see Common Structures "Passenger" DETAIL)
// ---------------------------------------------------------------------------

const passengerDetailBase = {
	rph: v.string(),
	roomRph: v.optional(v.string()),
	billingHolder: v.optional(BoolishSchema),
	masterRecordCode: v.optional(v.string()),
	name: v.string(),
	sex: GenderSchema,
	birthDate: v.optional(v.string()),
	birthPlace: v.optional(v.string()),
	nationCode: v.optional(v.string()),
	citizenshipCode: v.optional(v.string()),
	fiscalCode: v.optional(v.string()),
	phoneNumber: v.optional(v.string()),
	eMail: v.optional(v.string()),
	notes: v.optional(v.array(NoteDetailInputSchema)),
	flagStatus: v.optional(v.string()),
	offerCode: v.optional(v.string()),
	idDocInfo: v.optional(IdDocumentDetailInputSchema),
};

/** Passenger on CreateBookingFile — categoryCode required per AVES */
export const PassengerDetailCreateInputSchema = v.object({
	...passengerDetailBase,
	categoryCode: PassengerCategorySchema,
});

/** Passenger on ModBookingFileHeader / ModServices — categoryCode optional */
export const PassengerDetailPatchInputSchema = v.object({
	...passengerDetailBase,
	categoryCode: v.optional(PassengerCategorySchema),
});

// ---------------------------------------------------------------------------
// BookingFinancialInfo
// ---------------------------------------------------------------------------

export const BookingFinancialInfoInputSchema = v.object({
	customer_PaymentType: v.optional(CustomerPaymentTypeSchema),
	customer_SpecPaymentTypeCode: v.optional(v.string()),
});

// ---------------------------------------------------------------------------
// BookingFileRQ (root body - camelCase input)
// ---------------------------------------------------------------------------

/**
 * Booking file request body schema (camelCase input).
 * Maps to BookFileRQ in AVES XML 1.8.0 CreateBookingFile.
 * `*List` fields are flat Detail arrays; wire wrap happens in BookingFileApiSchema.
 * Accepts `customerRecordCode` as a shorthand for `customerDetail: { recordCode }`.
 */
export const BookingFileSchema = v.pipe(
	v.object({
		createDate: v.optional(v.string()),
		bookingFileRefCode: v.optional(v.string()),
		travelAgentCode: v.optional(v.string()),
		clerkName: v.optional(v.string()),
		customerDetail: v.optional(CustomerDetailInputSchema),
		customerRecordCode: v.optional(v.string()),
		currencyCode: v.optional(v.string()),
		markupCode: v.optional(v.string()),
		bookingFileStatus: BookingFileStatusInputSchema,
		statisticCodes: v.optional(StatisticCodesInputSchema),
		destination: v.optional(DestinationInputSchema),
		bookingFileDescription: v.optional(v.string()),
		startDate: v.string(),
		endDate: v.string(),
		earlyBookingDate: v.optional(v.string()),
		cupCode: v.optional(v.string()),
		cigCode: v.optional(v.string()),
		customerPromoterCode: v.optional(v.string()),
		billingReferenceCode: v.optional(v.string()),
		paymentReferenceCode: v.optional(v.string()),
		bookingFileDocument: v.optional(BookingFileDocumentInputSchema),
		financialDeadlineList: v.optional(
			v.array(FinancialDeadlineDetailInputSchema),
		),
		deadlineList: v.optional(v.array(DeadlineDetailInputSchema)),
		paymentList: v.optional(v.array(PaymentDetailInputSchema)),
		selectedPackageList: v.optional(v.array(SelectedPackageDetailInputSchema)),
		selectedServiceList: v.array(SelectedServiceDetailInputSchema),
		extraQuotaRefCode: v.optional(v.string()),
		extraQuoteServiceList: v.optional(
			v.array(SelectedServiceDetailInputSchema),
		),
		getExtraQuoteFromSystem: v.optional(BoolishSchema),
		passengerList: v.array(PassengerDetailCreateInputSchema),
		noteList: v.optional(v.array(NoteDetailInputSchema)),
		bookingFinancialInfo: v.optional(BookingFinancialInfoInputSchema),
		bookingFileCode: v.optional(v.string()),
		groupingPaxPolicy: v.optional(GroupingPaxPolicySchema),
		groupBookingFile: v.optional(BoolishSchema),
		typeDownloadFile: v.optional(TypeDownloadFileSchema),
		setBookingFileCodeFromStartDate: v.optional(BoolishSchema),
	}),
	v.check(
		(input) => !!(input.customerDetail || input.customerRecordCode),
		"customerDetail or customerRecordCode is required",
	),
	v.transform(coalesceCustomerRecordCode),
);

/**
 * Booking file schema for API requests (list wrap + PascalCase for BookFileRQ).
 */
export const BookingFileApiSchema = createApiSchema(
	BookingFileSchema,
	bookingFileWire,
);

/**
 * Shared booking response (Create / ModServices / SetStatus / SetStatusService).
 * Spreads `BookingFileDetail` onto the root; cancel extras stay sibling fields.
 */
export const BookingFileResponseSchema = createFlattenedResponseSchema(
	v.object({
		RsStatus: RsStatusSchema,
		BookingFileDetail: v.optional(BookingFileDetailApiSchema),
		PrintableDocumentsList: v.optional(PrintableDocumentsListApiSchema),
		TotalAmountDetailAfterCancellation: v.optional(TotalAmountDetailApiSchema),
		Base64DocContent: v.optional(v.string()),
	}),
	"bookingFileDetail",
);
