import * as v from "valibot";
import {
	CREATE_ARRAY_OF_ONE,
	CREATE_BOOKING_LIST_KEYS,
} from "../utils/booking-transform.js";
import {
	createApiSchema,
	createResponseSchema,
} from "../utils/schema-transform.js";
import { bookingFileWire } from "../utils/wire-shapes.js";
import {
	BookingFileDetailApiSchema,
	PrintableDocumentsListApiSchema,
	TotalAmountDetailApiSchema,
} from "./booking-response.js";
import {
	AvesServiceTypeSchema,
	BookingFileStatusRequestSchema,
	BoolishSchema,
	PaymentTypeSchema,
	ToServiceTypeSchema,
} from "./booking-shared.js";
import { RsStatusSchema } from "./common.js";

// ---------------------------------------------------------------------------
// BookingFileStatus
// ---------------------------------------------------------------------------

const BookingFileStatusInputSchema = v.object({
	value: BookingFileStatusRequestSchema,
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

const DestinationInputSchema = v.object({
	code: v.optional(v.string()),
	iataCode: v.optional(v.string()),
	nationCode: v.optional(v.string()),
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

const documentTypeSchema = v.union([
	v.literal("VISA_REQUEST"),
	v.literal("TRAVEL_INFORMATION"),
	v.literal("VOUCHER"),
	v.literal("BOOKING_CONTRACT"),
	v.literal("BOOKING_CONFIRMATION"),
	v.literal("SUPPLIER_SERVICE_LIST"),
	v.literal("INVOICE"),
	v.literal("PROFORMA_INVOICE"),
	v.literal("ADEGUAMENTO"),
	v.literal("RESERVATION_FORM"),
	v.literal("OPEN_XML"),
	v.literal("SALES_INVOICE"),
	v.literal("TICKETING_TMASTER"),
	v.literal("SUMMARY_FORM"),
]);

const ReservationFormCustomizablePrintParametersInputSchema = v.object({
	makeDocumentTo: v.optional(
		v.union([v.literal("BOOKING_CUSTOMER"), v.literal("FIRST_PASSENGER")]),
	),
});

const TravelInformationCustomizablePrintParametersInputSchema = v.object({
	fillInCode: v.optional(v.string()),
});

const DocumentCustomizablePrintParametersInputSchema = v.union([
	ReservationFormCustomizablePrintParametersInputSchema,
	TravelInformationCustomizablePrintParametersInputSchema,
]);

const InfoDocumentToPrintInputSchema = v.object({
	documentType: documentTypeSchema,
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
	paumentNote: v.optional(v.string()),
	amount: v.optional(v.string()),
	paymentUser: v.optional(v.string()),
	paymentType: v.optional(PaymentTypeSchema),
});

// ---------------------------------------------------------------------------
// SelectedPackageList / SelectedServiceList / ExtraQuoteServiceList
// ---------------------------------------------------------------------------

const costPriceTypeSchema = v.union([
	v.literal("PAX_QTY_DAY"),
	v.literal("PAX_QTY_NIGHT"),
	v.literal("PAX_QTY_WEEK"),
	v.literal("PAX_QTY"),
	v.literal("PAX_DAY"),
	v.literal("PAX_NIGHT"),
	v.literal("PAX_WEEK"),
	v.literal("PAX"),
	v.literal("QTY_DAY"),
	v.literal("QTY_NIGHT"),
	v.literal("QTY_WEE"),
	v.literal("QTY"),
	v.literal("DAY"),
	v.literal("NIGHT"),
	v.literal("WEEK"),
	v.literal("FORFAIT"),
]);

/** ServiceFare — cost/price of a selected or booked service */
export const ServiceFareInputSchema = v.object({
	currencyCode: v.optional(v.string()),
	exchangeRate: v.optional(v.string()),
	cost: v.optional(v.string()),
	costTax: v.optional(v.string()),
	costType: v.optional(costPriceTypeSchema),
	vatCostCurrencyCode: v.optional(v.string()),
	price: v.optional(v.string()),
	priceTax: v.optional(v.string()),
	priceType: v.optional(costPriceTypeSchema),
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

const paxAssociatedSchema = v.object({ pax: v.string() });

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
	paxAssociated: v.optional(v.array(paxAssociatedSchema)),
	avesSession: v.string(),
	avesServiceInfo: v.optional(AvesServiceInfoInputSchema),
	serviceFare: v.optional(ServiceFareInputSchema),
	bookedServiceRef: v.optional(v.string()),
	supplierMasterCode: v.optional(v.string()),
	voucherMasterCode: v.optional(v.string()),
	hotelServiceInfo: v.optional(v.string()),
	carRentalServiceInfo: v.optional(v.string()),
	flightServiceInfo: v.optional(v.string()),
	shipServiceInfo: v.optional(v.string()),
	ticketServiceInfo: v.optional(v.string()),
	commission: v.optional(v.string()),
	noteList: v.optional(v.string()),
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
// NoteList
// ---------------------------------------------------------------------------

const NoteDetailInputSchema = v.object({
	nType: v.optional(v.string()),
	title: v.optional(v.string()),
	text: v.optional(v.string()),
});

// ---------------------------------------------------------------------------
// PassengerList (PassengerDetail - see Common Structures "Passenger" DETAIL)
// ---------------------------------------------------------------------------

const passengerCategoryCodeSchema = v.union([
	v.literal("AD"),
	v.literal("CH"),
	v.literal("IN"),
	v.literal("OV"),
]);

const passengerDetailBase = {
	rph: v.string(),
	roomRph: v.optional(v.string()),
	billingHolder: v.optional(BoolishSchema),
	masterRecordCode: v.optional(v.string()),
	name: v.string(),
	sex: v.union([v.literal("M"), v.literal("F")]),
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
	idDocInfo: v.optional(
		v.object({
			idType: v.optional(v.string()),
			idCode: v.optional(v.string()),
			idIssueLocation: v.optional(v.string()),
			idIssueCounty: v.optional(v.string()),
			idIssueDate: v.optional(v.string()),
			idExpireDate: v.optional(v.string()),
		}),
	),
};

/** Passenger on CreateBookingFile — categoryCode required per AVES */
export const PassengerDetailCreateInputSchema = v.object({
	...passengerDetailBase,
	categoryCode: passengerCategoryCodeSchema,
});

/** Passenger on ModBookingFileHeader / ModServices — categoryCode optional */
export const PassengerDetailPatchInputSchema = v.object({
	...passengerDetailBase,
	categoryCode: v.optional(passengerCategoryCodeSchema),
});

// ---------------------------------------------------------------------------
// BookingFinancialInfo
// ---------------------------------------------------------------------------

const customerPaymentTypeSchema = v.union([
	v.literal("CASH"),
	v.literal("BANK"),
	v.literal("RID"),
	v.literal("RIBA"),
	v.literal("SPECIFIC_CODE"),
	v.literal("NOT_SET"),
]);

export const BookingFinancialInfoInputSchema = v.object({
	customer_PaymentType: v.optional(customerPaymentTypeSchema),
	customer_SpecPaymentTypeCode: v.optional(v.string()),
});

// ---------------------------------------------------------------------------
// GroupingPaxPolicy / TypeDownloadFile
// ---------------------------------------------------------------------------

const groupingPaxPolicySchema = v.union([
	v.literal("GROUPED_PAX"),
	v.literal("NOT_GROUPED_PAX"),
	v.literal("ONE_PAX_ONLY"),
]);

const typeDownloadFileSchema = v.union([
	v.literal("AVES2AVES"),
	v.literal("AVES2AVESVIA"),
	v.literal("AVES2AVESITA"),
]);

// ---------------------------------------------------------------------------
// BookingFileRQ (root body - camelCase input)
// ---------------------------------------------------------------------------

/**
 * Booking file request body schema (camelCase input).
 * Maps to BookFileRQ in AVES XML 1.8.0 CreateBookingFile.
 * `*List` fields are flat Detail arrays; wire wrap happens in BookingFileApiSchema.
 */
export const BookingFileSchema = v.object({
	createDate: v.optional(v.string()),
	bookingFileRefCode: v.optional(v.string()),
	travelAgentCode: v.optional(v.string()),
	clerkName: v.optional(v.string()),
	customerDetail: CustomerDetailInputSchema,
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
	extraQuoteServiceList: v.optional(v.array(SelectedServiceDetailInputSchema)),
	getExtraQuoteFromSystem: v.optional(BoolishSchema),
	passengerList: v.array(PassengerDetailCreateInputSchema),
	noteList: v.optional(v.array(NoteDetailInputSchema)),
	bookingFinancialInfo: v.optional(BookingFinancialInfoInputSchema),
	bookingFileCode: v.optional(v.string()),
	groupingPaxPolicy: v.optional(groupingPaxPolicySchema),
	groupBookingFile: v.optional(BoolishSchema),
	typeDownloadFile: v.optional(typeDownloadFileSchema),
	setBookingFileCodeFromStartDate: v.optional(BoolishSchema),
});

/**
 * Booking file schema for API requests (list wrap + PascalCase for BookFileRQ).
 */
export const BookingFileApiSchema = createApiSchema(
	BookingFileSchema,
	bookingFileWire,
	{
		listKeys: CREATE_BOOKING_LIST_KEYS,
		arrayOfOne: CREATE_ARRAY_OF_ONE,
	},
);

/**
 * Shared booking response (Create / ModServices / SetStatus / SetStatusService).
 * Extra cancel fields are optional and only present on some ops.
 */
export const BookingFileResponseSchema = createResponseSchema(
	v.object({
		RsStatus: RsStatusSchema,
		BookingFileDetail: v.optional(BookingFileDetailApiSchema),
		PrintableDocumentsList: v.optional(PrintableDocumentsListApiSchema),
		TotalAmountDetailAfterCancellation: v.optional(TotalAmountDetailApiSchema),
		Base64DocContent: v.optional(v.string()),
	}),
);
