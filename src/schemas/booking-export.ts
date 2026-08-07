/**
 * ExportBookingData — `BookingDataExportRQ` / `BookingDataExportRS`
 * (Booking.txt:11041-11976). The only AVES operation that reads a booking file
 * back whole: header, passengers, booked services with amounts, **payments**,
 * and an `ExtraInfo` block of lookup tables.
 *
 * Every field the spec gives a closed value list for is validated against an
 * enum. The two exceptions are `RegimeType` and `CustomerPayAt`: the response
 * table documents no values for the first and omits the second entirely, so
 * there is nothing to be strict against — see their field comments.
 */

import { Schema } from "effect";
import { exportBookingDataFacades } from "../utils/facade-aliases.js";
import {
	coalesceWireAliases,
	createApiSchema,
	createResponseSchema,
	facadeObject,
	listDetailApiSchema,
	mapSchema,
} from "../utils/schema-transform.js";
import { exportBookingDataWire } from "../utils/wire-shapes.js";
import {
	BookingFileStatusApiSchema,
	PassengerListApiSchema,
} from "./booking-response.js";
import {
	BoolishSchema,
	DateRangeSchema,
	RsStatusSchema,
	StringishSchema,
} from "./common.js";
import {
	AvesServiceTypeSchema,
	BookedServiceStatusSchema,
	BookingFileStatusSchema,
	CommissionIncomeTypeSchema,
	CommissionOwedTypeSchema,
	DeadlineStatusSchema,
	ExportTypeSchema,
	PrintableSchema,
	PrintTypeSchema,
	SellingTypeSchema,
	StatisticTypeSchema,
	TerritorialitySchema,
	ToServiceTypeSchema,
	ToSubServiceTypeSchema,
} from "./enums.js";
import { MasterRecordDetailApiValidationSchema } from "./master-record.js";

// ---------------------------------------------------------------------------
// BookingDataExportRQ
// ---------------------------------------------------------------------------

/** Paging window. Bounds are spec'd, not invented (Booking.txt:11104-11106). */
export const LimitRangeSchema = Schema.Struct({
	skip: Schema.Number.pipe(Schema.int(), Schema.greaterThanOrEqualTo(0)),
	take: Schema.Number.pipe(
		Schema.int(),
		Schema.greaterThanOrEqualTo(1),
		Schema.lessThanOrEqualTo(1000),
	),
});

/**
 * BookingDataExportRQ body (camelCase). Every field is an optional filter;
 * combining none of them exports everything the credentials can see, so pass
 * `limitRange` whenever the query is not pinned to a single `bookingFileCode`.
 */
export const ExportBookingDataSchema = facadeObject(
	{
		bookingFileCode: Schema.optional(Schema.String),
		startDate: Schema.optional(DateRangeSchema),
		endDate: Schema.optional(DateRangeSchema),
		createdDate: Schema.optional(DateRangeSchema),
		lastModificationDate: Schema.optional(DateRangeSchema),
		lastModificationDateTime: Schema.optional(DateRangeSchema),
		supplierRecordCode: Schema.optional(Schema.String),
		supplierVatCode: Schema.optional(Schema.String),
		supplierReference: Schema.optional(Schema.String),
		statusLists: Schema.optional(Schema.Array(BookingFileStatusSchema)),
		featureCodeList: Schema.optional(Schema.Array(Schema.String)),
		packageCodeList: Schema.optional(Schema.Array(Schema.String)),
		exportType: Schema.optional(ExportTypeSchema),
		/** Marks exported services undeletable — they can then only be cancelled. */
		markBookedServiceExported: Schema.optional(BoolishSchema),
		customerRecordCode: Schema.optional(Schema.String),
		customerReference: Schema.optional(Schema.String),
		customerPromoterCode: Schema.optional(Schema.String),
		firstPassengerName: Schema.optional(Schema.String),
		user: Schema.optional(Schema.String),
		limitRange: Schema.optional(LimitRangeSchema),
	},
	exportBookingDataFacades,
);

export const ExportBookingDataApiSchema = createApiSchema(
	ExportBookingDataSchema,
	exportBookingDataWire,
);

// ---------------------------------------------------------------------------
// BookingDataExportRS — booking file
// ---------------------------------------------------------------------------

const ExportedNoteDetailApiSchema = Schema.Struct({
	"@nType": Schema.optional(Schema.String),
	"@Title": Schema.optional(Schema.String),
	"#text": Schema.optional(StringishSchema),
});

const ExportedNoteListApiSchema = listDetailApiSchema(
	"NoteDetail",
	ExportedNoteDetailApiSchema,
);

const ExportedStatisticCodesApiSchema = Schema.Struct({
	"@sCode1": Schema.optional(Schema.String),
	"@sCode2": Schema.optional(Schema.String),
	"@sCode3": Schema.optional(Schema.String),
	"@sCode4": Schema.optional(Schema.String),
	"@sCode5": Schema.optional(Schema.String),
	"@sCode6": Schema.optional(Schema.String),
});

const EInvoicingDetailWireSchema = Schema.Struct({
	"@CUP": Schema.optional(Schema.String),
	"@CupCode": Schema.optional(Schema.String),
	"@CIG": Schema.optional(Schema.String),
	"@CigCode": Schema.optional(Schema.String),
	"@SupplyReferenceType": Schema.optional(Schema.String),
	"@DocumentNumber": Schema.optional(StringishSchema),
	"@DocumentDate": Schema.optional(Schema.String),
});

/** `@CUP`/`@CIG` normalize to the request-side `cupCode` / `cigCode` names. */
export const EInvoicingDetailApiSchema = mapSchema(
	EInvoicingDetailWireSchema,
	(detail) =>
		coalesceWireAliases(detail, {
			"@CupCode": ["@CupCode", "@CUP"],
			"@CigCode": ["@CigCode", "@CIG"],
		}),
);

const ExportedPaymentDetailWireSchema = Schema.Struct({
	"@PaymentDate": Schema.optional(Schema.String),
	"@PaymentNote": Schema.optional(Schema.String),
	// InsertFilePaymentList misspells this attribute; tolerate it on the way back.
	"@PaumentNote": Schema.optional(Schema.String),
	"@Amount": Schema.optional(StringishSchema),
	"@PaymentType": Schema.optional(Schema.String),
	"@PaymentUser": Schema.optional(Schema.String),
});

export const ExportedPaymentDetailApiSchema = mapSchema(
	ExportedPaymentDetailWireSchema,
	(payment) =>
		coalesceWireAliases(payment, {
			"@PaymentNote": ["@PaymentNote", "@PaumentNote"],
		}),
);

export const ExportedPaymentListApiSchema = listDetailApiSchema(
	"PaymentDetail",
	ExportedPaymentDetailApiSchema,
);

/** Per-service money. Documented as `AmountDetail`, sent as `AmountsDetail`. */
export const BookedServiceAmountsApiSchema = Schema.Struct({
	"@ReceiptsWithTax": Schema.optional(StringishSchema),
	"@ReceiptWithTaxAndVat": Schema.optional(StringishSchema),
	"@ReceiptTax": Schema.optional(StringishSchema),
	"@CostWithTax": Schema.optional(StringishSchema),
	"@CostWithTaxAndVat": Schema.optional(StringishSchema),
	"@CostTax": Schema.optional(StringishSchema),
	"@DiscountEarned": Schema.optional(StringishSchema),
	"@DiscountPaid": Schema.optional(StringishSchema),
	"@CommissionIncome": Schema.optional(StringishSchema),
	"@CommissionIncomeWithVat": Schema.optional(StringishSchema),
	"@CommissionOwed": Schema.optional(StringishSchema),
	"@CommissionOwedWithVat": Schema.optional(StringishSchema),
	"@InvoicingCostAmount": Schema.optional(StringishSchema),
	"@InvoicedCostAmount": Schema.optional(StringishSchema),
	"@InvoicingPriceAmount": Schema.optional(StringishSchema),
	"@InvoicedPriceAmount": Schema.optional(StringishSchema),
	"@DueToSupplier": Schema.optional(StringishSchema),
	"@Paid": Schema.optional(StringishSchema),
	"@PaidWithCreditCard": Schema.optional(StringishSchema),
	"@DueByCustomer": Schema.optional(StringishSchema),
	"@Cashed": Schema.optional(StringishSchema),
});

/** Deadline rows attached to a booked service (Booking.txt:11442-11456). */
const ExportedDeadlineDetailApiSchema = Schema.Struct({
	"@Code": Schema.optional(Schema.String),
	"@Description": Schema.optional(Schema.String),
	"@ExpireDate": Schema.optional(Schema.String),
	"@Status": Schema.optional(DeadlineStatusSchema),
	"@User": Schema.optional(Schema.String),
	"@Notes": Schema.optional(Schema.String),
	"@MasterDataSetExtraInfo": Schema.optional(Schema.String),
});

const ExportedDeadlineDataApiSchema = Schema.Struct({
	KeyValue: Schema.optional(StringishSchema),
	DeadlineDetail: Schema.optional(ExportedDeadlineDetailApiSchema),
});

const ExportedDeadlineListApiSchema = listDetailApiSchema(
	"DeadlineData",
	ExportedDeadlineDataApiSchema,
);

const commissionEntries = {
	"@Percentage": Schema.optional(StringishSchema),
	"@IsVatExcluded": Schema.optional(BoolishSchema),
	"@VatCode": Schema.optional(Schema.String),
	"@ServiceAmountVatCode": Schema.optional(Schema.String),
	"@ApplyToVatExcludedService": Schema.optional(BoolishSchema),
	Amount: Schema.optional(StringishSchema),
} as const;

/**
 * The spec names the element `CommissionIncomeDetails` (Occ 1) but titles the
 * attribute table `CommissionIncomeDetail`. Both shapes are accepted: attributes
 * on the wrapper, or a nested singular detail.
 */
export const CommissionIncomeDetailsApiSchema = Schema.Struct({
	...commissionEntries,
	"@Type": Schema.optional(CommissionIncomeTypeSchema),
	CommissionIncomeDetail: Schema.optional(
		Schema.Struct({
			...commissionEntries,
			"@Type": Schema.optional(CommissionIncomeTypeSchema),
		}),
	),
});

export const CommissionOwedDetailsApiSchema = Schema.Struct({
	...commissionEntries,
	"@Type": Schema.optional(CommissionOwedTypeSchema),
	CommissionOwedDetail: Schema.optional(
		Schema.Struct({
			...commissionEntries,
			"@Type": Schema.optional(CommissionOwedTypeSchema),
		}),
	),
});

const BookedServiceDataWireSchema = Schema.Struct({
	"@RPH": Schema.String,
	"@ServiceCode": Schema.optional(Schema.String),
	AvesServiceType: Schema.optional(AvesServiceTypeSchema),
	TOServiceType: Schema.optional(ToServiceTypeSchema),
	TOSubServiceType: Schema.optional(ToSubServiceTypeSchema),
	ToSubServiceType: Schema.optional(ToSubServiceTypeSchema),
	FirstDescription: Schema.optional(Schema.String),
	SecondDescription: Schema.optional(Schema.String),
	StartDate: Schema.optional(Schema.String),
	EndDate: Schema.optional(Schema.String),
	CreationDate: Schema.optional(Schema.String),
	SellingType: Schema.optional(SellingTypeSchema),
	Printable: Schema.optional(PrintableSchema),
	Qty: Schema.optional(StringishSchema),
	Pax: Schema.optional(StringishSchema),
	ServiceStatus: Schema.optional(BookedServiceStatusSchema),
	StatusDateTime: Schema.optional(Schema.String),
	CausalAccountingCode: Schema.optional(Schema.String),
	/** Booking.txt:11312 documents no value list — the example shows `O`. */
	RegimeType: Schema.optional(Schema.String),
	AgentCode: Schema.optional(Schema.String),
	BillingSubjectCode: Schema.optional(Schema.String),
	CollectionSubjectCode: Schema.optional(Schema.String),
	VoucherRegistryCode: Schema.optional(Schema.String),
	ServiceStatisticCode: Schema.optional(Schema.String),
	Referent: Schema.optional(Schema.String),
	Reference: Schema.optional(Schema.String),
	ReceiptOffertCode: Schema.optional(Schema.String),
	Exported: Schema.optional(BoolishSchema),
	ReceiptVatCode: Schema.optional(Schema.String),
	CostVatCode: Schema.optional(Schema.String),
	CommissionOwedVatCode: Schema.optional(Schema.String),
	/** Absent from the RS table; only ever seen as `OUR_AGENCY` in the example. */
	CustomerPayAt: Schema.optional(Schema.String),
	PaidByCreditCardCompany: Schema.optional(Schema.String),
	LinkedServiceForCancellation: Schema.optional(Schema.String),
	AccommodationReference: Schema.optional(Schema.String),
	PolicySerial: Schema.optional(Schema.String),
	PolicyNumber: Schema.optional(StringishSchema),
	FullTotalVolumeCost: Schema.optional(StringishSchema),
	EstimatedTotalVolumeCost: Schema.optional(StringishSchema),
	FinalTotalVolumeCost: Schema.optional(StringishSchema),
	ReceiptsCurrencyCode: Schema.optional(Schema.String),
	CostsCurrencyCode: Schema.optional(Schema.String),
	AmountsDetail: Schema.optional(BookedServiceAmountsApiSchema),
	AmountDetail: Schema.optional(BookedServiceAmountsApiSchema),
	DeadlineList: Schema.optional(ExportedDeadlineListApiSchema),
	CommissionIncomeDetails: Schema.optional(CommissionIncomeDetailsApiSchema),
	CommissionOwedDetails: Schema.optional(CommissionOwedDetailsApiSchema),
	NoteList: Schema.optional(ExportedNoteListApiSchema),
});

/**
 * BookedServiceData — one cost/receipt line of the exported file.
 * `TOSubServiceType` normalizes to `ToSubServiceType` so it camelizes to
 * `toSubServiceType` rather than `tOSubServiceType`.
 */
export const BookedServiceDataApiSchema = mapSchema(
	BookedServiceDataWireSchema,
	(service) =>
		coalesceWireAliases(service, {
			ToSubServiceType: ["ToSubServiceType", "TOSubServiceType"],
			AmountsDetail: ["AmountsDetail", "AmountDetail"],
		}),
);

export const BookedServicesApiSchema = listDetailApiSchema(
	"BookedServiceData",
	BookedServiceDataApiSchema,
);

/** File-level totals (Booking.txt:11500-11524). */
export const BookedFileAmountsApiSchema = Schema.Struct({
	"@CustomerTotalAmount": Schema.optional(StringishSchema),
	"@CustomerTotalAmountWithVat": Schema.optional(StringishSchema),
	"@CustomerDueAmount": Schema.optional(StringishSchema),
	"@CustomerCommission": Schema.optional(StringishSchema),
	"@CustomerCommissionWithVat": Schema.optional(StringishSchema),
	"@CustomerDiscount": Schema.optional(StringishSchema),
	"@CustomerBalanceAmount": Schema.optional(StringishSchema),
	"@SupplierTotalAmount": Schema.optional(StringishSchema),
	"@SupplierTotalAmountWithVat": Schema.optional(StringishSchema),
	"@SupplierDueAmount": Schema.optional(StringishSchema),
	"@SupplierCommission": Schema.optional(StringishSchema),
	"@SupplierCommissionWithVat": Schema.optional(StringishSchema),
	"@SupplierBalanceAmount": Schema.optional(StringishSchema),
	"@TotalGainAmount": Schema.optional(StringishSchema),
	"@TotalGainPercentage": Schema.optional(StringishSchema),
});

/** Customer print history (Booking.txt:11197-11207). */
const ProcessedPrintDetailApiSchema = Schema.Struct({
	"@PrintType": Schema.optional(PrintTypeSchema),
	"@PrintProtocol": Schema.optional(StringishSchema),
	"@PrintDate": Schema.optional(Schema.String),
});

const CustomerProcessedPrintListApiSchema = listDetailApiSchema(
	"ProcessedPrintDetail",
	ProcessedPrintDetailApiSchema,
);

const instalmentEntries = {
	"@ExpiryDate": Schema.optional(Schema.String),
	"@Amount": Schema.optional(StringishSchema),
	"@CashedDate": Schema.optional(Schema.String),
	"@CashedAmount": Schema.optional(StringishSchema),
} as const;

/** Customer instalment plans (Booking.txt:11387-11405). */
const InstalmentPlanApiSchema = Schema.Struct({
	"@Code": Schema.optional(Schema.String),
	Instalments: Schema.optional(
		listDetailApiSchema("Instalment", Schema.Struct(instalmentEntries)),
	),
});

/** Supplier instalment plans (Booking.txt:11409-11437). */
const SupplierInstalmentPlanApiSchema = Schema.Struct({
	"@Code": Schema.optional(Schema.String),
	"@SupplierMasterCode": Schema.optional(Schema.String),
	"@PaymentRefMasterCode": Schema.optional(Schema.String),
	"@CurrencyCode": Schema.optional(Schema.String),
	SupplierInstalments: Schema.optional(
		listDetailApiSchema("SupplierInstalment", Schema.Struct(instalmentEntries)),
	),
});

const ExportedBookingFileWireSchema = Schema.Struct({
	"@BookingFileCode": Schema.optional(Schema.String),
	BookingFileCode: Schema.optional(Schema.String),
	Description: Schema.optional(Schema.String),
	BookingFileStatus: Schema.optional(BookingFileStatusApiSchema),
	LastModificationDate: Schema.optional(Schema.String),
	CreationDate: Schema.optional(Schema.String),
	StartDate: Schema.optional(Schema.String),
	EndDate: Schema.optional(Schema.String),
	CustomerRecordCode: Schema.optional(Schema.String),
	// AVES spells this "FirstConfemationDate" on the wire.
	FirstConfemationDate: Schema.optional(Schema.String),
	FirstConfirmationDate: Schema.optional(Schema.String),
	BillingSubjectCode: Schema.optional(Schema.String),
	CollectionSubjectCode: Schema.optional(Schema.String),
	PaxNumber: Schema.optional(StringishSchema),
	User: Schema.optional(Schema.String),
	TravelAgencyCode: Schema.optional(Schema.String),
	Applicant: Schema.optional(Schema.String),
	Reference: Schema.optional(Schema.String),
	CustomerPromoterCode: Schema.optional(Schema.String),
	PackageCode: Schema.optional(Schema.String),
	Nation: Schema.optional(Schema.String),
	Destination: Schema.optional(Schema.String),
	StatisticCodes: Schema.optional(ExportedStatisticCodesApiSchema),
	CurrencyCode: Schema.optional(Schema.String),
	EInvoicingDetail: Schema.optional(EInvoicingDetailApiSchema),
	CustomerProcessedPrintList: Schema.optional(
		CustomerProcessedPrintListApiSchema,
	),
	PassengerList: Schema.optional(PassengerListApiSchema),
	BookedServices: Schema.optional(BookedServicesApiSchema),
	PaymentList: Schema.optional(ExportedPaymentListApiSchema),
	NoteList: Schema.optional(ExportedNoteListApiSchema),
	InstalmentPlanList: Schema.optional(
		listDetailApiSchema("InstalmentPlan", InstalmentPlanApiSchema),
	),
	SupplierInstalmentPlanList: Schema.optional(
		listDetailApiSchema(
			"SupplierInstalmentPlan",
			SupplierInstalmentPlanApiSchema,
		),
	),
	DeadlineList: Schema.optional(ExportedDeadlineListApiSchema),
	BookedFileAmounts: Schema.optional(BookedFileAmountsApiSchema),
});

/**
 * BookingFileData — an exported booking file.
 * `BookingFileCode` is an attribute here (Booking.txt:11705) but an element in
 * BOOKEDFILE responses; both spellings coalesce onto the attribute.
 */
export const ExportedBookingFileApiSchema = mapSchema(
	ExportedBookingFileWireSchema,
	(file) =>
		coalesceWireAliases(file, {
			"@BookingFileCode": ["@BookingFileCode", "BookingFileCode"],
			FirstConfirmationDate: ["FirstConfirmationDate", "FirstConfemationDate"],
		}),
);

// ---------------------------------------------------------------------------
// BookingDataExportRS — ExtraInfo lookup tables
// ---------------------------------------------------------------------------

const codeDescriptionEntries = {
	"@Code": Schema.optional(Schema.String),
	"@Description": Schema.optional(Schema.String),
} as const;

const CodeDescriptionApiSchema = Schema.Struct(codeDescriptionEntries);

const codeDescriptionList = (detailKey: string) =>
	listDetailApiSchema(detailKey, CodeDescriptionApiSchema);

const VatDetailApiSchema = Schema.Struct({
	...codeDescriptionEntries,
	"@Rate": Schema.optional(StringishSchema),
	"@ExtendedDescription": Schema.optional(Schema.String),
});

const NationDetailApiSchema = Schema.Struct({
	"@Code": Schema.optional(Schema.String),
	"@Name": Schema.optional(Schema.String),
	"@IsoCode": Schema.optional(Schema.String),
	"@Territoriality": Schema.optional(TerritorialitySchema),
});

const TravelAgentDetailApiSchema = Schema.Struct({
	"@Code": Schema.optional(Schema.String),
	"@Name": Schema.optional(Schema.String),
	"@BirthDate": Schema.optional(Schema.String),
	"@ExtendedDescription": Schema.optional(Schema.String),
	"@ReferenceAgencyCode": Schema.optional(Schema.String),
	"@Enabled": Schema.optional(BoolishSchema),
});

const ProgramDetailApiSchema = Schema.Struct({
	...codeDescriptionEntries,
	"@ExtendedDescription": Schema.optional(Schema.String),
});

const StatisticDetailApiSchema = Schema.Struct({
	...codeDescriptionEntries,
	"@Type": Schema.optional(StatisticTypeSchema),
});

const UserDetailApiSchema = Schema.Struct({
	...codeDescriptionEntries,
	"@OfficeCode": Schema.optional(Schema.String),
	"@OfficeDescription": Schema.optional(Schema.String),
	"@SectorCode": Schema.optional(Schema.String),
	"@SectorDescription": Schema.optional(Schema.String),
});

/**
 * MasterData rows are full master records and validate as such — the same
 * schema `master.search` returns. Its response-side `RecordType` accepts
 * `NOT_SET`, which is what these lookup rows carry.
 */
const ExportedMasterDataApiSchema = MasterRecordDetailApiValidationSchema;

const MasterDataSetExtraInfoApiSchema = Schema.Struct({
	CategoryList: Schema.optional(codeDescriptionList("CategoryDetail")),
	NetworkList: Schema.optional(codeDescriptionList("NetworkDetail")),
	LanguageList: Schema.optional(codeDescriptionList("LanguageDetail")),
	DiscountList: Schema.optional(codeDescriptionList("DiscountDetail")),
	ActivityList: Schema.optional(codeDescriptionList("ActivityDetail")),
	ZoneList: Schema.optional(codeDescriptionList("ZoneDetail")),
	BookingPayConditionList: Schema.optional(
		codeDescriptionList("BookingPayConditionDetail"),
	),
});

const ExportExtraInfoWireSchema = Schema.Struct({
	MasterDataSet: Schema.optional(
		listDetailApiSchema("MasterData", ExportedMasterDataApiSchema),
	),
	CurrencyList: Schema.optional(codeDescriptionList("CurrencyDetail")),
	VatList: Schema.optional(
		listDetailApiSchema("VatDetail", VatDetailApiSchema),
	),
	NationList: Schema.optional(
		listDetailApiSchema("NationDetail", NationDetailApiSchema),
	),
	TravelAgentList: Schema.optional(
		listDetailApiSchema("TravelAgentDetail", TravelAgentDetailApiSchema),
	),
	ProgramList: Schema.optional(
		listDetailApiSchema("ProgramDetail", ProgramDetailApiSchema),
	),
	StatisticList: Schema.optional(
		listDetailApiSchema("StatisticDetail", StatisticDetailApiSchema),
	),
	PriceOffertList: Schema.optional(codeDescriptionList("PriceOffertDetail")),
	// Documented as UserList, sent as UsersList (Booking.txt:11600, :11955).
	UserList: Schema.optional(
		listDetailApiSchema("UserDetail", UserDetailApiSchema),
	),
	UsersList: Schema.optional(
		listDetailApiSchema("UserDetail", UserDetailApiSchema),
	),
	PassengerCategoryList: Schema.optional(
		codeDescriptionList("PassengerCategoryDetail"),
	),
	MasterDataSetExtraInfo: Schema.optional(MasterDataSetExtraInfoApiSchema),
});

/**
 * ExtraInfo — the lookup tables the exported codes resolve against.
 * `nationList[].territoriality` is what decides a booking's VAT regime.
 */
export const ExportExtraInfoApiSchema = mapSchema(
	ExportExtraInfoWireSchema,
	(info) => coalesceWireAliases(info, { UserList: ["UserList", "UsersList"] }),
);

export const ExportBookingDataResponseSchema = createResponseSchema(
	Schema.Struct({
		RsStatus: RsStatusSchema,
		BookingFileList: Schema.optional(
			listDetailApiSchema("BookingFileData", ExportedBookingFileApiSchema),
		),
		ExtraInfo: Schema.optional(ExportExtraInfoApiSchema),
	}),
);
