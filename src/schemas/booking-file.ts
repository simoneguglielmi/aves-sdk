import { Schema } from "effect";
import {
	bookingRootFacades,
	bookingServiceFacades,
	noteFacades,
	passengerFacades,
	selectedPackageFacades,
} from "../utils/facade-aliases.js";
import {
	coalesceCustomerRecordCode,
	createApiSchema,
	createFlattenedResponseSchema,
	facadeObject,
	mapSchema,
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
import { BoolishSchema, RsStatusSchema } from "./common.js";
import { DestinationTypeSchema } from "./enums.js";
import { IdDocumentDetailInputSchema } from "./master-record.js";

// ---------------------------------------------------------------------------
// BookingFileStatus
// ---------------------------------------------------------------------------

const BookingFileStatusInputSchema = valueFieldSchema(BookingFileStatusSchema, {
	expiredDate: Schema.optional(Schema.String),
});

// ---------------------------------------------------------------------------
// StatisticCodes (AvesStatisticCodes)
// ---------------------------------------------------------------------------

export const StatisticCodesInputSchema = Schema.Struct({
	sCode1: Schema.optional(Schema.String.pipe(Schema.maxLength(4))),
	sCode2: Schema.optional(Schema.String.pipe(Schema.maxLength(4))),
	sCode3: Schema.optional(Schema.String.pipe(Schema.maxLength(4))),
	sCode4: Schema.optional(Schema.String.pipe(Schema.maxLength(4))),
	sCode5: Schema.optional(Schema.String.pipe(Schema.maxLength(4))),
	sCode6: Schema.optional(Schema.String.pipe(Schema.maxLength(4))),
});

// ---------------------------------------------------------------------------
// Destination
// ---------------------------------------------------------------------------

export const DestinationInputSchema = Schema.Struct({
	code: Schema.optional(Schema.String),
	iataCode: Schema.optional(Schema.String),
	nationCode: Schema.optional(Schema.String),
	type: Schema.optional(DestinationTypeSchema),
});

// ---------------------------------------------------------------------------
// CustomerDetail (record code only or full master record data)
// ---------------------------------------------------------------------------

const CustomerDetailInputSchema = Schema.Struct({
	recordCode: Schema.optional(Schema.String),
	// When inserting new record, master record fields can be provided (see Common Structures)
});

// ---------------------------------------------------------------------------
// BookingFileDocument
// ---------------------------------------------------------------------------

const ReservationFormCustomizablePrintParametersInputSchema = Schema.Struct({
	makeDocumentTo: Schema.optional(MakeDocumentToSchema),
});

const TravelInformationCustomizablePrintParametersInputSchema = Schema.Struct({
	fillInCode: Schema.optional(Schema.String),
});

const DocumentCustomizablePrintParametersInputSchema = Schema.Union(
	ReservationFormCustomizablePrintParametersInputSchema,
	TravelInformationCustomizablePrintParametersInputSchema,
);

const InfoDocumentToPrintInputSchema = Schema.Struct({
	documentType: DocumentTypeSchema,
	documentCustomizablePrintParameters: Schema.optional(
		DocumentCustomizablePrintParametersInputSchema,
	),
});

export const BookingFileDocumentInputSchema = Schema.Struct({
	printDoc: Schema.optional(BoolishSchema),
	sendDocViaEmail: Schema.optional(BoolishSchema),
	infoDocumentsToPrint: Schema.optional(
		Schema.Array(InfoDocumentToPrintInputSchema),
	),
});

// ---------------------------------------------------------------------------
// FinancialDeadlineList / DeadlineList / PaymentList
// ---------------------------------------------------------------------------

const FinancialDeadlineDetailInputSchema = Schema.Struct({
	reschedulingCode: Schema.optional(Schema.String),
	expireDate: Schema.optional(Schema.String),
	totalAmount: Schema.optional(Schema.String),
});

const DeadlineDetailInputSchema = Schema.Struct({
	deadlineCode: Schema.optional(Schema.String),
	description: Schema.optional(Schema.String),
	expireDate: Schema.optional(Schema.String),
});

const PaymentDetailInputSchema = Schema.Struct({
	paymentDate: Schema.optional(Schema.String),
	paymentNote: Schema.optional(Schema.String),
	amount: Schema.optional(Schema.String),
	paymentUser: Schema.optional(Schema.String),
	paymentType: Schema.optional(PaymentTypeSchema),
});

// ---------------------------------------------------------------------------
// SelectedPackageList / SelectedServiceList / ExtraQuoteServiceList
// ---------------------------------------------------------------------------

const NoteDetailInputSchema = facadeObject(
	{
		nType: Schema.optional(Schema.String),
		title: Schema.optional(Schema.String),
		text: Schema.optional(Schema.String),
	},
	noteFacades,
);

/** ServiceFare — cost/price of a selected or booked service */
export const ServiceFareInputSchema = Schema.Struct({
	currencyCode: Schema.optional(Schema.String),
	exchangeRate: Schema.optional(Schema.String),
	cost: Schema.optional(Schema.String),
	costTax: Schema.optional(Schema.String),
	costType: Schema.optional(CostPriceTypeSchema),
	vatCostCurrencyCode: Schema.optional(Schema.String),
	price: Schema.optional(Schema.String),
	priceTax: Schema.optional(Schema.String),
	priceType: Schema.optional(CostPriceTypeSchema),
});

export const AvesServiceInfoInputSchema = Schema.Struct({
	packageCode: Schema.optional(Schema.String),
	packageReference: Schema.optional(Schema.String),
	suballotmentCode: Schema.optional(Schema.String),
	priceListCode: Schema.optional(Schema.String),
	costListCode: Schema.optional(Schema.String),
	externalFileCode: Schema.optional(Schema.String),
	externalReference: Schema.optional(Schema.String),
	serviceStatus: Schema.optional(Schema.String),
	serviceStatisticCode: Schema.optional(Schema.String),
	serviceFare: Schema.optional(ServiceFareInputSchema),
});

export const SelectedServiceDetailInputSchema = facadeObject(
	{
		sCode: Schema.String,
		ssCode: Schema.optional(Schema.String),
		avesServiceType: AvesServiceTypeSchema,
		toServiceType: Schema.optional(ToServiceTypeSchema),
		subServiceDesc: Schema.optional(Schema.String),
		startDate: Schema.String,
		endDate: Schema.String,
		qty: Schema.String,
		pax: Schema.String,
		paxAssociated: Schema.optional(
			Schema.Union(
				Schema.Array(Schema.String),
				Schema.Array(Schema.Struct({ pax: Schema.String })),
			),
		),
		avesSession: Schema.String,
		avesServiceInfo: Schema.optional(AvesServiceInfoInputSchema),
		serviceFare: Schema.optional(ServiceFareInputSchema),
		bookedServiceRef: Schema.optional(Schema.String),
		supplierMasterCode: Schema.optional(Schema.String),
		voucherMasterCode: Schema.optional(Schema.String),
		// Known gaps: AVES service-info variants remain unmodeled raw strings.
		hotelServiceInfo: Schema.optional(Schema.String),
		carRentalServiceInfo: Schema.optional(Schema.String),
		flightServiceInfo: Schema.optional(Schema.String),
		shipServiceInfo: Schema.optional(Schema.String),
		ticketServiceInfo: Schema.optional(Schema.String),
		commission: Schema.optional(Schema.String),
		noteList: Schema.optional(Schema.Array(NoteDetailInputSchema)),
		// Known gap: AVES voucher info remains an unmodeled raw string.
		voucherInfo: Schema.optional(Schema.String),
		firstDescription: Schema.optional(Schema.String),
		secondDescription: Schema.optional(Schema.String),
	},
	bookingServiceFacades,
);

export const SelectedPackageDetailInputSchema = facadeObject(
	{
		pCode: Schema.String,
		startDate: Schema.String,
		endDate: Schema.String,
		getServicesFromPackage: Schema.optional(BoolishSchema),
	},
	selectedPackageFacades,
);

// ---------------------------------------------------------------------------
// PassengerList (PassengerDetail - see Common Structures "Passenger" DETAIL)
// ---------------------------------------------------------------------------

const passengerDetailBase = {
	rph: Schema.String,
	roomRph: Schema.optional(Schema.String),
	billingHolder: Schema.optional(BoolishSchema),
	masterRecordCode: Schema.optional(Schema.String),
	name: Schema.String,
	sex: GenderSchema,
	birthDate: Schema.optional(Schema.String),
	birthPlace: Schema.optional(Schema.String),
	nationCode: Schema.optional(Schema.String),
	citizenshipCode: Schema.optional(Schema.String),
	fiscalCode: Schema.optional(Schema.String),
	phoneNumber: Schema.optional(Schema.String),
	eMail: Schema.optional(Schema.String),
	notes: Schema.optional(Schema.Array(NoteDetailInputSchema)),
	flagStatus: Schema.optional(Schema.String),
	offerCode: Schema.optional(Schema.String),
	idDocInfo: Schema.optional(IdDocumentDetailInputSchema),
};

/** Passenger on CreateBookingFile — categoryCode required per AVES */
export const PassengerDetailCreateInputSchema = facadeObject(
	{
		...passengerDetailBase,
		categoryCode: PassengerCategorySchema,
	},
	passengerFacades,
);

/** Passenger on ModBookingFileHeader / ModServices — categoryCode optional */
export const PassengerDetailPatchInputSchema = facadeObject(
	{
		...passengerDetailBase,
		categoryCode: Schema.optional(PassengerCategorySchema),
	},
	passengerFacades,
);

// ---------------------------------------------------------------------------
// BookingFinancialInfo
// ---------------------------------------------------------------------------

export const BookingFinancialInfoInputSchema = Schema.Struct({
	customer_PaymentType: Schema.optional(CustomerPaymentTypeSchema),
	customer_SpecPaymentTypeCode: Schema.optional(Schema.String),
});

// ---------------------------------------------------------------------------
// BookingFileRQ (root body - camelCase input)
// ---------------------------------------------------------------------------

/**
 * Booking file request body schema (camelCase input).
 * Maps to BookFileRQ in AVES XML 1.8.0 CreateBookingFile.
 * `*List` fields are flat Detail arrays; wire wrap happens in BookingFileApiSchema.
 * Accepts `customerRecordCode` / `customerCode` and other facade aliases.
 */
const BookingFileEntriesSchema = facadeObject(
	{
		createDate: Schema.optional(Schema.String),
		bookingFileRefCode: Schema.optional(Schema.String),
		travelAgentCode: Schema.optional(Schema.String),
		clerkName: Schema.optional(Schema.String),
		customerDetail: Schema.optional(CustomerDetailInputSchema),
		customerRecordCode: Schema.optional(Schema.String),
		currencyCode: Schema.optional(Schema.String),
		markupCode: Schema.optional(Schema.String),
		bookingFileStatus: BookingFileStatusInputSchema,
		statisticCodes: Schema.optional(StatisticCodesInputSchema),
		destination: Schema.optional(DestinationInputSchema),
		bookingFileDescription: Schema.optional(Schema.String),
		startDate: Schema.String,
		endDate: Schema.String,
		earlyBookingDate: Schema.optional(Schema.String),
		cupCode: Schema.optional(Schema.String),
		cigCode: Schema.optional(Schema.String),
		customerPromoterCode: Schema.optional(Schema.String),
		billingReferenceCode: Schema.optional(Schema.String),
		paymentReferenceCode: Schema.optional(Schema.String),
		bookingFileDocument: Schema.optional(BookingFileDocumentInputSchema),
		financialDeadlineList: Schema.optional(
			Schema.Array(FinancialDeadlineDetailInputSchema),
		),
		deadlineList: Schema.optional(Schema.Array(DeadlineDetailInputSchema)),
		paymentList: Schema.optional(Schema.Array(PaymentDetailInputSchema)),
		selectedPackageList: Schema.optional(
			Schema.Array(SelectedPackageDetailInputSchema),
		),
		selectedServiceList: Schema.Array(SelectedServiceDetailInputSchema),
		extraQuotaRefCode: Schema.optional(Schema.String),
		extraQuoteServiceList: Schema.optional(
			Schema.Array(SelectedServiceDetailInputSchema),
		),
		getExtraQuoteFromSystem: Schema.optional(BoolishSchema),
		passengerList: Schema.Array(PassengerDetailCreateInputSchema),
		noteList: Schema.optional(Schema.Array(NoteDetailInputSchema)),
		bookingFinancialInfo: Schema.optional(BookingFinancialInfoInputSchema),
		bookingFileCode: Schema.optional(Schema.String),
		groupingPaxPolicy: Schema.optional(GroupingPaxPolicySchema),
		groupBookingFile: Schema.optional(BoolishSchema),
		typeDownloadFile: Schema.optional(TypeDownloadFileSchema),
		setBookingFileCodeFromStartDate: Schema.optional(BoolishSchema),
	},
	bookingRootFacades,
);

export const BookingFileSchema = mapSchema(
	BookingFileEntriesSchema.pipe(
		Schema.filter(
			(input: Schema.Schema.Type<typeof BookingFileEntriesSchema>) =>
				!!(input.customerDetail || input.customerRecordCode),
			{
				message: () => "customerDetail or customerRecordCode is required",
			},
		),
	),
	coalesceCustomerRecordCode,
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
	Schema.Struct({
		RsStatus: RsStatusSchema,
		BookingFileDetail: Schema.optional(BookingFileDetailApiSchema),
		PrintableDocumentsList: Schema.optional(PrintableDocumentsListApiSchema),
		TotalAmountDetailAfterCancellation: Schema.optional(
			TotalAmountDetailApiSchema,
		),
		Base64DocContent: Schema.optional(Schema.String),
	}),
	"bookingFileDetail",
);
