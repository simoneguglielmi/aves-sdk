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

import * as v from "valibot";
import { exportBookingDataFacades } from "../utils/facade-aliases.js";
import {
	coalesceWireAliases,
	createApiSchema,
	createResponseSchema,
	facadeObject,
	listDetailApiSchema,
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
export const LimitRangeSchema = v.object({
	skip: v.pipe(v.number(), v.integer(), v.minValue(0)),
	take: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(1000)),
});

/**
 * BookingDataExportRQ body (camelCase). Every field is an optional filter;
 * combining none of them exports everything the credentials can see, so pass
 * `limitRange` whenever the query is not pinned to a single `bookingFileCode`.
 */
export const ExportBookingDataSchema = facadeObject(
	{
		bookingFileCode: v.optional(v.string()),
		startDate: v.optional(DateRangeSchema),
		endDate: v.optional(DateRangeSchema),
		createdDate: v.optional(DateRangeSchema),
		lastModificationDate: v.optional(DateRangeSchema),
		lastModificationDateTime: v.optional(DateRangeSchema),
		supplierRecordCode: v.optional(v.string()),
		supplierVatCode: v.optional(v.string()),
		supplierReference: v.optional(v.string()),
		statusLists: v.optional(v.array(BookingFileStatusSchema)),
		featureCodeList: v.optional(v.array(v.string())),
		packageCodeList: v.optional(v.array(v.string())),
		exportType: v.optional(ExportTypeSchema),
		/** Marks exported services undeletable — they can then only be cancelled. */
		markBookedServiceExported: v.optional(BoolishSchema),
		customerRecordCode: v.optional(v.string()),
		customerReference: v.optional(v.string()),
		customerPromoterCode: v.optional(v.string()),
		firstPassengerName: v.optional(v.string()),
		user: v.optional(v.string()),
		limitRange: v.optional(LimitRangeSchema),
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

const ExportedNoteDetailApiSchema = v.object({
	"@nType": v.optional(v.string()),
	"@Title": v.optional(v.string()),
	"#text": v.optional(StringishSchema),
});

const ExportedNoteListApiSchema = listDetailApiSchema(
	"NoteDetail",
	ExportedNoteDetailApiSchema,
);

const ExportedStatisticCodesApiSchema = v.object({
	"@sCode1": v.optional(v.string()),
	"@sCode2": v.optional(v.string()),
	"@sCode3": v.optional(v.string()),
	"@sCode4": v.optional(v.string()),
	"@sCode5": v.optional(v.string()),
	"@sCode6": v.optional(v.string()),
});

const EInvoicingDetailWireSchema = v.object({
	"@CUP": v.optional(v.string()),
	"@CupCode": v.optional(v.string()),
	"@CIG": v.optional(v.string()),
	"@CigCode": v.optional(v.string()),
	"@SupplyReferenceType": v.optional(v.string()),
	"@DocumentNumber": v.optional(StringishSchema),
	"@DocumentDate": v.optional(v.string()),
});

/** `@CUP`/`@CIG` normalize to the request-side `cupCode` / `cigCode` names. */
export const EInvoicingDetailApiSchema = v.pipe(
	EInvoicingDetailWireSchema,
	v.transform((detail) =>
		coalesceWireAliases(detail, {
			"@CupCode": ["@CupCode", "@CUP"],
			"@CigCode": ["@CigCode", "@CIG"],
		}),
	),
);

const ExportedPaymentDetailWireSchema = v.object({
	"@PaymentDate": v.optional(v.string()),
	"@PaymentNote": v.optional(v.string()),
	// InsertFilePaymentList misspells this attribute; tolerate it on the way back.
	"@PaumentNote": v.optional(v.string()),
	"@Amount": v.optional(StringishSchema),
	"@PaymentType": v.optional(v.string()),
	"@PaymentUser": v.optional(v.string()),
});

export const ExportedPaymentDetailApiSchema = v.pipe(
	ExportedPaymentDetailWireSchema,
	v.transform((payment) =>
		coalesceWireAliases(payment, {
			"@PaymentNote": ["@PaymentNote", "@PaumentNote"],
		}),
	),
);

export const ExportedPaymentListApiSchema = listDetailApiSchema(
	"PaymentDetail",
	ExportedPaymentDetailApiSchema,
);

/** Per-service money. Documented as `AmountDetail`, sent as `AmountsDetail`. */
export const BookedServiceAmountsApiSchema = v.object({
	"@ReceiptsWithTax": v.optional(StringishSchema),
	"@ReceiptWithTaxAndVat": v.optional(StringishSchema),
	"@ReceiptTax": v.optional(StringishSchema),
	"@CostWithTax": v.optional(StringishSchema),
	"@CostWithTaxAndVat": v.optional(StringishSchema),
	"@CostTax": v.optional(StringishSchema),
	"@DiscountEarned": v.optional(StringishSchema),
	"@DiscountPaid": v.optional(StringishSchema),
	"@CommissionIncome": v.optional(StringishSchema),
	"@CommissionIncomeWithVat": v.optional(StringishSchema),
	"@CommissionOwed": v.optional(StringishSchema),
	"@CommissionOwedWithVat": v.optional(StringishSchema),
	"@InvoicingCostAmount": v.optional(StringishSchema),
	"@InvoicedCostAmount": v.optional(StringishSchema),
	"@InvoicingPriceAmount": v.optional(StringishSchema),
	"@InvoicedPriceAmount": v.optional(StringishSchema),
	"@DueToSupplier": v.optional(StringishSchema),
	"@Paid": v.optional(StringishSchema),
	"@PaidWithCreditCard": v.optional(StringishSchema),
	"@DueByCustomer": v.optional(StringishSchema),
	"@Cashed": v.optional(StringishSchema),
});

/** Deadline rows attached to a booked service (Booking.txt:11442-11456). */
const ExportedDeadlineDetailApiSchema = v.object({
	"@Code": v.optional(v.string()),
	"@Description": v.optional(v.string()),
	"@ExpireDate": v.optional(v.string()),
	"@Status": v.optional(DeadlineStatusSchema),
	"@User": v.optional(v.string()),
	"@Notes": v.optional(v.string()),
	"@MasterDataSetExtraInfo": v.optional(v.string()),
});

const ExportedDeadlineDataApiSchema = v.object({
	KeyValue: v.optional(StringishSchema),
	DeadlineDetail: v.optional(ExportedDeadlineDetailApiSchema),
});

const ExportedDeadlineListApiSchema = listDetailApiSchema(
	"DeadlineData",
	ExportedDeadlineDataApiSchema,
);

const commissionEntries = {
	"@Percentage": v.optional(StringishSchema),
	"@IsVatExcluded": v.optional(BoolishSchema),
	"@VatCode": v.optional(v.string()),
	"@ServiceAmountVatCode": v.optional(v.string()),
	"@ApplyToVatExcludedService": v.optional(BoolishSchema),
	Amount: v.optional(StringishSchema),
} as const;

/**
 * The spec names the element `CommissionIncomeDetails` (Occ 1) but titles the
 * attribute table `CommissionIncomeDetail`. Both shapes are accepted: attributes
 * on the wrapper, or a nested singular detail.
 */
export const CommissionIncomeDetailsApiSchema = v.object({
	...commissionEntries,
	"@Type": v.optional(CommissionIncomeTypeSchema),
	CommissionIncomeDetail: v.optional(
		v.object({
			...commissionEntries,
			"@Type": v.optional(CommissionIncomeTypeSchema),
		}),
	),
});

export const CommissionOwedDetailsApiSchema = v.object({
	...commissionEntries,
	"@Type": v.optional(CommissionOwedTypeSchema),
	CommissionOwedDetail: v.optional(
		v.object({
			...commissionEntries,
			"@Type": v.optional(CommissionOwedTypeSchema),
		}),
	),
});

const BookedServiceDataWireSchema = v.object({
	"@RPH": v.string(),
	"@ServiceCode": v.optional(v.string()),
	AvesServiceType: v.optional(AvesServiceTypeSchema),
	TOServiceType: v.optional(ToServiceTypeSchema),
	TOSubServiceType: v.optional(ToSubServiceTypeSchema),
	ToSubServiceType: v.optional(ToSubServiceTypeSchema),
	FirstDescription: v.optional(v.string()),
	SecondDescription: v.optional(v.string()),
	StartDate: v.optional(v.string()),
	EndDate: v.optional(v.string()),
	CreationDate: v.optional(v.string()),
	SellingType: v.optional(SellingTypeSchema),
	Printable: v.optional(PrintableSchema),
	Qty: v.optional(StringishSchema),
	Pax: v.optional(StringishSchema),
	ServiceStatus: v.optional(BookedServiceStatusSchema),
	StatusDateTime: v.optional(v.string()),
	CausalAccountingCode: v.optional(v.string()),
	/** Booking.txt:11312 documents no value list — the example shows `O`. */
	RegimeType: v.optional(v.string()),
	AgentCode: v.optional(v.string()),
	BillingSubjectCode: v.optional(v.string()),
	CollectionSubjectCode: v.optional(v.string()),
	VoucherRegistryCode: v.optional(v.string()),
	ServiceStatisticCode: v.optional(v.string()),
	Referent: v.optional(v.string()),
	Reference: v.optional(v.string()),
	ReceiptOffertCode: v.optional(v.string()),
	Exported: v.optional(BoolishSchema),
	ReceiptVatCode: v.optional(v.string()),
	CostVatCode: v.optional(v.string()),
	CommissionOwedVatCode: v.optional(v.string()),
	/** Absent from the RS table; only ever seen as `OUR_AGENCY` in the example. */
	CustomerPayAt: v.optional(v.string()),
	PaidByCreditCardCompany: v.optional(v.string()),
	LinkedServiceForCancellation: v.optional(v.string()),
	AccommodationReference: v.optional(v.string()),
	PolicySerial: v.optional(v.string()),
	PolicyNumber: v.optional(StringishSchema),
	FullTotalVolumeCost: v.optional(StringishSchema),
	EstimatedTotalVolumeCost: v.optional(StringishSchema),
	FinalTotalVolumeCost: v.optional(StringishSchema),
	ReceiptsCurrencyCode: v.optional(v.string()),
	CostsCurrencyCode: v.optional(v.string()),
	AmountsDetail: v.optional(BookedServiceAmountsApiSchema),
	AmountDetail: v.optional(BookedServiceAmountsApiSchema),
	DeadlineList: v.optional(ExportedDeadlineListApiSchema),
	CommissionIncomeDetails: v.optional(CommissionIncomeDetailsApiSchema),
	CommissionOwedDetails: v.optional(CommissionOwedDetailsApiSchema),
	NoteList: v.optional(ExportedNoteListApiSchema),
});

/**
 * BookedServiceData — one cost/receipt line of the exported file.
 * `TOSubServiceType` normalizes to `ToSubServiceType` so it camelizes to
 * `toSubServiceType` rather than `tOSubServiceType`.
 */
export const BookedServiceDataApiSchema = v.pipe(
	BookedServiceDataWireSchema,
	v.transform((service) =>
		coalesceWireAliases(service, {
			ToSubServiceType: ["ToSubServiceType", "TOSubServiceType"],
			AmountsDetail: ["AmountsDetail", "AmountDetail"],
		}),
	),
);

export const BookedServicesApiSchema = listDetailApiSchema(
	"BookedServiceData",
	BookedServiceDataApiSchema,
);

/** File-level totals (Booking.txt:11500-11524). */
export const BookedFileAmountsApiSchema = v.object({
	"@CustomerTotalAmount": v.optional(StringishSchema),
	"@CustomerTotalAmountWithVat": v.optional(StringishSchema),
	"@CustomerDueAmount": v.optional(StringishSchema),
	"@CustomerCommission": v.optional(StringishSchema),
	"@CustomerCommissionWithVat": v.optional(StringishSchema),
	"@CustomerDiscount": v.optional(StringishSchema),
	"@CustomerBalanceAmount": v.optional(StringishSchema),
	"@SupplierTotalAmount": v.optional(StringishSchema),
	"@SupplierTotalAmountWithVat": v.optional(StringishSchema),
	"@SupplierDueAmount": v.optional(StringishSchema),
	"@SupplierCommission": v.optional(StringishSchema),
	"@SupplierCommissionWithVat": v.optional(StringishSchema),
	"@SupplierBalanceAmount": v.optional(StringishSchema),
	"@TotalGainAmount": v.optional(StringishSchema),
	"@TotalGainPercentage": v.optional(StringishSchema),
});

/** Customer print history (Booking.txt:11197-11207). */
const ProcessedPrintDetailApiSchema = v.object({
	"@PrintType": v.optional(PrintTypeSchema),
	"@PrintProtocol": v.optional(StringishSchema),
	"@PrintDate": v.optional(v.string()),
});

const CustomerProcessedPrintListApiSchema = listDetailApiSchema(
	"ProcessedPrintDetail",
	ProcessedPrintDetailApiSchema,
);

const instalmentEntries = {
	"@ExpiryDate": v.optional(v.string()),
	"@Amount": v.optional(StringishSchema),
	"@CashedDate": v.optional(v.string()),
	"@CashedAmount": v.optional(StringishSchema),
} as const;

/** Customer instalment plans (Booking.txt:11387-11405). */
const InstalmentPlanApiSchema = v.object({
	"@Code": v.optional(v.string()),
	Instalments: v.optional(
		listDetailApiSchema("Instalment", v.object(instalmentEntries)),
	),
});

/** Supplier instalment plans (Booking.txt:11409-11437). */
const SupplierInstalmentPlanApiSchema = v.object({
	"@Code": v.optional(v.string()),
	"@SupplierMasterCode": v.optional(v.string()),
	"@PaymentRefMasterCode": v.optional(v.string()),
	"@CurrencyCode": v.optional(v.string()),
	SupplierInstalments: v.optional(
		listDetailApiSchema("SupplierInstalment", v.object(instalmentEntries)),
	),
});

const ExportedBookingFileWireSchema = v.object({
	"@BookingFileCode": v.optional(v.string()),
	BookingFileCode: v.optional(v.string()),
	Description: v.optional(v.string()),
	BookingFileStatus: v.optional(BookingFileStatusApiSchema),
	LastModificationDate: v.optional(v.string()),
	CreationDate: v.optional(v.string()),
	StartDate: v.optional(v.string()),
	EndDate: v.optional(v.string()),
	CustomerRecordCode: v.optional(v.string()),
	// AVES spells this "FirstConfemationDate" on the wire.
	FirstConfemationDate: v.optional(v.string()),
	FirstConfirmationDate: v.optional(v.string()),
	BillingSubjectCode: v.optional(v.string()),
	CollectionSubjectCode: v.optional(v.string()),
	PaxNumber: v.optional(StringishSchema),
	User: v.optional(v.string()),
	TravelAgencyCode: v.optional(v.string()),
	Applicant: v.optional(v.string()),
	Reference: v.optional(v.string()),
	CustomerPromoterCode: v.optional(v.string()),
	PackageCode: v.optional(v.string()),
	Nation: v.optional(v.string()),
	Destination: v.optional(v.string()),
	StatisticCodes: v.optional(ExportedStatisticCodesApiSchema),
	CurrencyCode: v.optional(v.string()),
	EInvoicingDetail: v.optional(EInvoicingDetailApiSchema),
	CustomerProcessedPrintList: v.optional(CustomerProcessedPrintListApiSchema),
	PassengerList: v.optional(PassengerListApiSchema),
	BookedServices: v.optional(BookedServicesApiSchema),
	PaymentList: v.optional(ExportedPaymentListApiSchema),
	NoteList: v.optional(ExportedNoteListApiSchema),
	InstalmentPlanList: v.optional(
		listDetailApiSchema("InstalmentPlan", InstalmentPlanApiSchema),
	),
	SupplierInstalmentPlanList: v.optional(
		listDetailApiSchema(
			"SupplierInstalmentPlan",
			SupplierInstalmentPlanApiSchema,
		),
	),
	DeadlineList: v.optional(ExportedDeadlineListApiSchema),
	BookedFileAmounts: v.optional(BookedFileAmountsApiSchema),
});

/**
 * BookingFileData — an exported booking file.
 * `BookingFileCode` is an attribute here (Booking.txt:11705) but an element in
 * BOOKEDFILE responses; both spellings coalesce onto the attribute.
 */
export const ExportedBookingFileApiSchema = v.pipe(
	ExportedBookingFileWireSchema,
	v.transform((file) =>
		coalesceWireAliases(file, {
			"@BookingFileCode": ["@BookingFileCode", "BookingFileCode"],
			FirstConfirmationDate: ["FirstConfirmationDate", "FirstConfemationDate"],
		}),
	),
);

// ---------------------------------------------------------------------------
// BookingDataExportRS — ExtraInfo lookup tables
// ---------------------------------------------------------------------------

const codeDescriptionEntries = {
	"@Code": v.optional(v.string()),
	"@Description": v.optional(v.string()),
} as const;

const CodeDescriptionApiSchema = v.object(codeDescriptionEntries);

const codeDescriptionList = (detailKey: string) =>
	listDetailApiSchema(detailKey, CodeDescriptionApiSchema);

const VatDetailApiSchema = v.object({
	...codeDescriptionEntries,
	"@Rate": v.optional(StringishSchema),
	"@ExtendedDescription": v.optional(v.string()),
});

const NationDetailApiSchema = v.object({
	"@Code": v.optional(v.string()),
	"@Name": v.optional(v.string()),
	"@IsoCode": v.optional(v.string()),
	"@Territoriality": v.optional(TerritorialitySchema),
});

const TravelAgentDetailApiSchema = v.object({
	"@Code": v.optional(v.string()),
	"@Name": v.optional(v.string()),
	"@BirthDate": v.optional(v.string()),
	"@ExtendedDescription": v.optional(v.string()),
	"@ReferenceAgencyCode": v.optional(v.string()),
	"@Enabled": v.optional(BoolishSchema),
});

const ProgramDetailApiSchema = v.object({
	...codeDescriptionEntries,
	"@ExtendedDescription": v.optional(v.string()),
});

const StatisticDetailApiSchema = v.object({
	...codeDescriptionEntries,
	"@Type": v.optional(StatisticTypeSchema),
});

const UserDetailApiSchema = v.object({
	...codeDescriptionEntries,
	"@OfficeCode": v.optional(v.string()),
	"@OfficeDescription": v.optional(v.string()),
	"@SectorCode": v.optional(v.string()),
	"@SectorDescription": v.optional(v.string()),
});

/**
 * MasterData rows are full master records and validate as such — the same
 * schema `master.search` returns. Its response-side `RecordType` accepts
 * `NOT_SET`, which is what these lookup rows carry.
 */
const ExportedMasterDataApiSchema = MasterRecordDetailApiValidationSchema;

const MasterDataSetExtraInfoApiSchema = v.object({
	CategoryList: v.optional(codeDescriptionList("CategoryDetail")),
	NetworkList: v.optional(codeDescriptionList("NetworkDetail")),
	LanguageList: v.optional(codeDescriptionList("LanguageDetail")),
	DiscountList: v.optional(codeDescriptionList("DiscountDetail")),
	ActivityList: v.optional(codeDescriptionList("ActivityDetail")),
	ZoneList: v.optional(codeDescriptionList("ZoneDetail")),
	BookingPayConditionList: v.optional(
		codeDescriptionList("BookingPayConditionDetail"),
	),
});

const ExportExtraInfoWireSchema = v.object({
	MasterDataSet: v.optional(
		listDetailApiSchema("MasterData", ExportedMasterDataApiSchema),
	),
	CurrencyList: v.optional(codeDescriptionList("CurrencyDetail")),
	VatList: v.optional(listDetailApiSchema("VatDetail", VatDetailApiSchema)),
	NationList: v.optional(
		listDetailApiSchema("NationDetail", NationDetailApiSchema),
	),
	TravelAgentList: v.optional(
		listDetailApiSchema("TravelAgentDetail", TravelAgentDetailApiSchema),
	),
	ProgramList: v.optional(
		listDetailApiSchema("ProgramDetail", ProgramDetailApiSchema),
	),
	StatisticList: v.optional(
		listDetailApiSchema("StatisticDetail", StatisticDetailApiSchema),
	),
	PriceOffertList: v.optional(codeDescriptionList("PriceOffertDetail")),
	// Documented as UserList, sent as UsersList (Booking.txt:11600, :11955).
	UserList: v.optional(listDetailApiSchema("UserDetail", UserDetailApiSchema)),
	UsersList: v.optional(listDetailApiSchema("UserDetail", UserDetailApiSchema)),
	PassengerCategoryList: v.optional(
		codeDescriptionList("PassengerCategoryDetail"),
	),
	MasterDataSetExtraInfo: v.optional(MasterDataSetExtraInfoApiSchema),
});

/**
 * ExtraInfo — the lookup tables the exported codes resolve against.
 * `nationList[].territoriality` is what decides a booking's VAT regime.
 */
export const ExportExtraInfoApiSchema = v.pipe(
	ExportExtraInfoWireSchema,
	v.transform((info) =>
		coalesceWireAliases(info, { UserList: ["UserList", "UsersList"] }),
	),
);

export const ExportBookingDataResponseSchema = createResponseSchema(
	v.object({
		RsStatus: RsStatusSchema,
		BookingFileList: v.optional(
			listDetailApiSchema("BookingFileData", ExportedBookingFileApiSchema),
		),
		ExtraInfo: v.optional(ExportExtraInfoApiSchema),
	}),
);
