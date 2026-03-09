import * as v from "valibot";
import { camelToPascalKeys } from "../utils/case-transform.js";
import { createResponseSchema } from "../utils/schema-transform.js";
import { RsStatusSchema } from "./common.js";

// ---------------------------------------------------------------------------
// BookingFileStatus
// ---------------------------------------------------------------------------

const bookingFileStatusValueSchema = v.union([
	v.literal("QUOTATION"),
	v.literal("WORK_IN_PROGRESS"),
	v.literal("CONFIRM"),
	v.literal("CONFIRMED"),
	v.literal("OPTION"),
	v.literal("OPTIONED"),
	v.literal("REQUEST"),
	v.literal("CANCELED"),
]);

const BookingFileStatusInputSchema = v.object({
	value: bookingFileStatusValueSchema,
	expiredDate: v.optional(v.string()),
});

// ---------------------------------------------------------------------------
// StatisticCodes (AvesStatisticCodes)
// ---------------------------------------------------------------------------

const StatisticCodesInputSchema = v.object({
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

const BookingFileDocumentInputSchema = v.object({
	printDoc: v.optional(
		v.union([v.literal("true"), v.literal("false"), v.boolean()]),
	),
	sendDocViaEmail: v.optional(
		v.union([v.literal("true"), v.literal("false"), v.boolean()]),
	),
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

const paymentTypeDetailSchema = v.union([
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

const PaymentDetailInputSchema = v.object({
	paymentDate: v.optional(v.string()),
	paumentNote: v.optional(v.string()),
	amount: v.optional(v.string()),
	paymentUser: v.optional(v.string()),
	paymentType: v.optional(paymentTypeDetailSchema),
});

const FinancialDeadlineListInputSchema = v.object({
	deadlineDetail: v.optional(v.array(FinancialDeadlineDetailInputSchema)),
});

const DeadlineListInputSchema = v.object({
	deadlineDetail: v.optional(v.array(DeadlineDetailInputSchema)),
});

const PaymentListInputSchema = v.object({
	paymentDetail: v.optional(v.array(PaymentDetailInputSchema)),
});

// ---------------------------------------------------------------------------
// SelectedPackageList / SelectedServiceList / ExtraQuoteServiceList
// ---------------------------------------------------------------------------

const SelectedPackageDetailInputSchema = v.object({
	pCode: v.optional(v.string()),
	startDate: v.optional(v.string()),
	endDate: v.optional(v.string()),
	getServicesFromPackage: v.optional(
		v.union([v.literal("true"), v.literal("false"), v.boolean()]),
	),
});

const AvesServiceInfoInputSchema = v.object({
	packageCode: v.optional(v.string()),
	packageReference: v.optional(v.string()),
});

const avesServiceTypeSchema = v.union([
	v.literal("TOP"),
	v.literal("TOP_SS"),
	v.literal("ADV"),
	v.literal("GRP"),
	v.literal("OTHER"),
]);

const toServiceTypeSchema = v.union([
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

const SelectedServiceDetailInputSchema = v.object({
	sCode: v.string(),
	ssCode: v.optional(v.string()),
	avesServiceType: v.optional(avesServiceTypeSchema),
	toServiceType: v.optional(toServiceTypeSchema),
	subServiceDesc: v.optional(v.string()),
	startDate: v.optional(v.string()),
	endDate: v.optional(v.string()),
	qty: v.optional(v.string()),
	pax: v.optional(v.string()),
	paxAssociated: v.optional(v.array(v.object({ pax: v.optional(v.string()) }))),
	avesSession: v.optional(v.string()),
	avesServiceInfo: v.optional(AvesServiceInfoInputSchema),
	supplierMasterCode: v.optional(v.string()),
	supplierName: v.optional(v.string()),
	supplierMasterSearchField: v.optional(v.string()),
	supplierFiscalCode: v.optional(v.string()),
});

const SelectedPackageListInputSchema = v.object({
	selectedPackageDetail: v.optional(v.array(SelectedPackageDetailInputSchema)),
});

const SelectedServiceListInputSchema = v.object({
	selectedServiceDetail: v.pipe(
		v.union([
			v.array(SelectedServiceDetailInputSchema),
			SelectedServiceDetailInputSchema,
		]),
		v.transform((input) => (Array.isArray(input) ? input : [input])),
	),
});

const ExtraQuoteServiceListInputSchema = v.object({
	extraQuoteServiceDetail: v.optional(
		v.array(SelectedServiceDetailInputSchema),
	),
});

// ---------------------------------------------------------------------------
// NoteList
// ---------------------------------------------------------------------------

const NoteDetailInputSchema = v.object({
	nType: v.optional(v.string()),
	title: v.optional(v.string()),
	text: v.optional(v.string()),
});

const NoteListInputSchema = v.object({
	noteDetail: v.optional(v.array(NoteDetailInputSchema)),
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

const PassengerDetailInputSchema = v.object({
	rph: v.string(),
	roomRph: v.optional(v.string()),
	billingHolder: v.optional(
		v.union([v.literal("true"), v.literal("false"), v.boolean()]),
	),
	masterRecordCode: v.optional(v.string()),
	name: v.string(),
	categoryCode: passengerCategoryCodeSchema,
	sex: v.optional(v.union([v.literal("M"), v.literal("F")])),
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
});

const PassengerListInputSchema = v.object({
	passengerDetail: v.pipe(
		v.union([v.array(PassengerDetailInputSchema), PassengerDetailInputSchema]),
		v.transform((input) => (Array.isArray(input) ? input : [input])),
	),
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

const BookingFinancialInfoInputSchema = v.object({
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
	financialDeadlineList: v.optional(FinancialDeadlineListInputSchema),
	deadlineList: v.optional(DeadlineListInputSchema),
	paymentList: v.optional(PaymentListInputSchema),
	selectedPackageList: v.optional(SelectedPackageListInputSchema),
	selectedServiceList: SelectedServiceListInputSchema,
	extraQuotaRefCode: v.optional(v.string()),
	extraQuoteServiceList: v.optional(ExtraQuoteServiceListInputSchema),
	getExtraQuoteFromSystem: v.optional(
		v.union([v.literal("true"), v.literal("false"), v.boolean()]),
	),
	passengerList: PassengerListInputSchema,
	noteList: v.optional(NoteListInputSchema),
	bookingFinancialInfo: v.optional(BookingFinancialInfoInputSchema),
	bookingFileCode: v.optional(v.string()),
	groupingPaxPolicy: v.optional(groupingPaxPolicySchema),
	groupBookingFile: v.optional(
		v.union([v.literal("true"), v.literal("false"), v.boolean()]),
	),
	typeDownloadFile: v.optional(typeDownloadFileSchema),
	setBookingFileCodeFromStartDate: v.optional(
		v.union([v.literal("true"), v.literal("false"), v.boolean()]),
	),
});

/**
 * Booking file schema for API requests (transforms to PascalCase for BookFileRQ).
 * Root-level startDate/endDate stay as elements; same keys in SelectedPackageDetail become @ attributes.
 */
export const BookingFileApiSchema = v.pipe(
	BookingFileSchema,
	v.transform((input) =>
		camelToPascalKeys(input, {
			excludeFromAttributePrefix: ["startDate", "endDate"],
		}),
	),
);

/**
 * BookingFileRS response schema (transforms to camelCase).
 * BookingFileDetail shape follows Common Structures "BOOKEDFILE"; nested content is accepted and key-normalized.
 */
export const BookingFileResponseSchema = createResponseSchema(
	v.object({
		RsStatus: RsStatusSchema,
		BookingFileDetail: v.optional(v.any()),
	}),
);
