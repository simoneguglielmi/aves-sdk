import { Schema } from "effect";
import {
	coalesceWireAliases,
	listDetailApiSchema,
	mapSchema,
} from "../utils/schema-transform.js";
import {
	AvesServiceTypeSchema,
	BookedServiceStatusSchema,
	BookingFileStatusWireSchema,
	canonicalizeBookingFileStatus,
	ToServiceTypeSchema,
} from "./booking-shared.js";
import { StringishSchema } from "./common.js";

/** BookingFileStatus in BOOKEDFILE responses — aliases normalized to canonical values */
export const BookingFileStatusApiSchema = mapSchema(
	Schema.Struct({
		"@Value": BookingFileStatusWireSchema,
		"@ExpiredDate": Schema.optional(Schema.String),
		"@ExpireDate": Schema.optional(Schema.String),
	}),
	(status) => ({
		...coalesceWireAliases(status, {
			"@ExpiredDate": ["@ExpiredDate", "@ExpireDate"],
		}),
		"@Value": canonicalizeBookingFileStatus(status["@Value"]),
	}),
);

export const PricePerPaxDetailApiSchema = Schema.Struct({
	"@PaxRef": Schema.String,
	"@Price": StringishSchema,
});

export const PaxPriceListApiSchema = listDetailApiSchema(
	"PricePerPaxDetail",
	PricePerPaxDetailApiSchema,
);

export const ServiceTotalAmountDetailApiSchema = Schema.Struct({
	"@CommissionCode": Schema.optional(Schema.String),
	"@CommissionPercentage": Schema.optional(StringishSchema),
	"@CommissionAmount": Schema.optional(StringishSchema),
	"@PriceListCode": Schema.optional(Schema.String),
	"@CostListCode": Schema.optional(Schema.String),
	"@ServiceTotalPrice": Schema.optional(StringishSchema),
	PaxPriceList: Schema.optional(PaxPriceListApiSchema),
});

export const SupplierInfoApiSchema = Schema.Struct({
	"@Code": Schema.optional(Schema.String),
	"@Name": Schema.optional(Schema.String),
	"@Email": Schema.optional(Schema.String),
	"@LanguageCode": Schema.optional(Schema.String),
});

export const WebStatisticApiSchema = Schema.Struct({
	"@Code": Schema.optional(Schema.String),
	"@Description": Schema.optional(Schema.String),
});

/** Wire schema — accepts AVES dialect aliases, then normalizes */
const BookedServiceDetailWireSchema = Schema.Struct({
	"@RPH": Schema.String,
	"@ServiceCode": Schema.optional(Schema.String),
	"@FromExternalProvider": Schema.optional(StringishSchema),
	"@isFromExternalProvider": Schema.optional(StringishSchema),
	AvesServiceType: Schema.optional(AvesServiceTypeSchema),
	TOServiceType: Schema.optional(ToServiceTypeSchema),
	FirstDescription: Schema.optional(Schema.String),
	SecondDescription: Schema.optional(Schema.String),
	ThirdDescription: Schema.optional(Schema.String),
	FourthDescription: Schema.optional(Schema.String),
	ServiceStatus: Schema.optional(BookedServiceStatusSchema),
	StartDate: Schema.optional(Schema.String),
	EndDate: Schema.optional(Schema.String),
	Qty: Schema.optional(StringishSchema),
	Pax: Schema.optional(StringishSchema),
	PeriodType: Schema.optional(Schema.String),
	PaxMultiplier: Schema.optional(Schema.String),
	ExternalProviderCode: Schema.optional(Schema.String),
	WebStatisticCode: Schema.optional(Schema.String),
	WebStatisticDescription: Schema.optional(Schema.String),
	WebStatistic: Schema.optional(WebStatisticApiSchema),
	SupplierInfo: Schema.optional(SupplierInfoApiSchema),
	ServiceTotalAmountDetail: Schema.optional(ServiceTotalAmountDetailApiSchema),
});

/** BookedServiceDetail — single fromExternalProvider after normalize */
export const BookedServiceDetailApiSchema = mapSchema(
	BookedServiceDetailWireSchema,
	(service) =>
		coalesceWireAliases(service, {
			"@FromExternalProvider": [
				"@FromExternalProvider",
				"@isFromExternalProvider",
			],
		}),
);

export const BookedServiceListApiSchema = listDetailApiSchema(
	"BookedServiceDetail",
	BookedServiceDetailApiSchema,
);

/** TotalAmountDetail — attributes on BOOKEDFILE */
export const TotalAmountDetailApiSchema = Schema.Struct({
	"@CurrencyCode": Schema.optional(Schema.String),
	"@TotalAmountBeforeDiscount": Schema.optional(StringishSchema),
	"@TotalAmountAfterDiscount": Schema.optional(StringishSchema),
	"@TotalDiscount": Schema.optional(StringishSchema),
	"@TotalAmountWithoutVat": Schema.optional(StringishSchema),
	"@DueAmount": Schema.optional(StringishSchema),
	"@PaiedAmount": Schema.optional(StringishSchema),
	"@Balance": Schema.optional(StringishSchema),
});

export const PassengerDetailApiSchema = Schema.Struct({
	"@RPH": Schema.String,
	"@RoomRPH": Schema.optional(Schema.String),
	"@BillingHolder": Schema.optional(StringishSchema),
	Name: Schema.optional(Schema.String),
	CategoryCode: Schema.optional(Schema.String),
	Sex: Schema.optional(Schema.String),
	BirthDate: Schema.optional(Schema.String),
	BirthPlace: Schema.optional(Schema.String),
	NationCode: Schema.optional(Schema.String),
	CitizenshipCode: Schema.optional(Schema.String),
	FiscalCode: Schema.optional(Schema.String),
	PhoneNumber: Schema.optional(Schema.String),
	EMail: Schema.optional(Schema.String),
	MasterRecordCode: Schema.optional(Schema.String),
});

export const PassengerListApiSchema = listDetailApiSchema(
	"PassengerDetail",
	PassengerDetailApiSchema,
);

const FinancialDeadlineDetailWireSchema = Schema.Struct({
	"@ReschedulingCode": Schema.optional(Schema.String),
	"@ExpireDate": Schema.optional(Schema.String),
	"@TotalAmount": Schema.optional(StringishSchema),
	ReschedulingCode: Schema.optional(Schema.String),
	ExpireDate: Schema.optional(Schema.String),
	TotalAmount: Schema.optional(StringishSchema),
});

export const FinancialDeadlineDetailApiSchema = mapSchema(
	FinancialDeadlineDetailWireSchema,
	(deadline) =>
		coalesceWireAliases(deadline, {
			"@ReschedulingCode": ["@ReschedulingCode", "ReschedulingCode"],
			"@ExpireDate": ["@ExpireDate", "ExpireDate"],
			"@TotalAmount": ["@TotalAmount", "TotalAmount"],
		}),
);

export const FinancialDeadlineListApiSchema = listDetailApiSchema(
	"DeadlineDetail",
	FinancialDeadlineDetailApiSchema,
);

export const StoredDocumentDetailApiSchema = Schema.Struct({
	DocumentRefCode: Schema.optional(Schema.String),
	DocumentType: Schema.optional(Schema.String),
	DocumentName: Schema.optional(Schema.String),
	ArchiviationDescription: Schema.optional(Schema.String),
});

export const StoredDocumentsListApiSchema = listDetailApiSchema(
	"StoredDocumentDetail",
	StoredDocumentDetailApiSchema,
);

export const PrintableDocumentDetailApiSchema = Schema.Struct({
	DocumentType: Schema.optional(Schema.String),
	DocumentName: Schema.optional(Schema.String),
	Enabled: Schema.optional(StringishSchema),
});

export const PrintableDocumentsListApiSchema = listDetailApiSchema(
	"PrintableDocumentDetail",
	PrintableDocumentDetailApiSchema,
);

const BookingFileDetailWireSchema = Schema.Struct({
	"@BookingFileCode": Schema.optional(Schema.String),
	BookingFileCode: Schema.optional(Schema.String),
	CustomerRecordCode: Schema.optional(Schema.String),
	CustomerName: Schema.optional(Schema.String),
	CustomerEmail: Schema.optional(Schema.String),
	TravelAgencyName: Schema.optional(Schema.String),
	TravelAgencyEmail: Schema.optional(Schema.String),
	BookingFileStatus: Schema.optional(BookingFileStatusApiSchema),
	Description: Schema.optional(Schema.String),
	Nation: Schema.optional(Schema.String),
	Destination: Schema.optional(Schema.String),
	CreationDate: Schema.optional(Schema.String),
	FirstConfirmationDate: Schema.optional(Schema.String),
	StartDate: Schema.optional(Schema.String),
	EndDate: Schema.optional(Schema.String),
	PackageCode: Schema.optional(Schema.String),
	BookedServiceList: Schema.optional(BookedServiceListApiSchema),
	TotalAmountDetail: Schema.optional(TotalAmountDetailApiSchema),
	PaxNumber: Schema.optional(StringishSchema),
	PassengerList: Schema.optional(PassengerListApiSchema),
	Reference: Schema.optional(Schema.String),
	ClerkName: Schema.optional(Schema.String),
	StoredDocumentsList: Schema.optional(StoredDocumentsListApiSchema),
	PrintableDocumentsList: Schema.optional(PrintableDocumentsListApiSchema),
	FinancialDeadlineList: Schema.optional(FinancialDeadlineListApiSchema),
});

/**
 * BookingFileDetail — Common Structures "BOOKEDFILE".
 * Accepts wire dialects, normalizes to a single PascalCase/@attr shape for camelCase mapping.
 * Nested `*List` fields are already flat Detail arrays.
 */
export const BookingFileDetailApiSchema = mapSchema(
	BookingFileDetailWireSchema,
	(detail) =>
		coalesceWireAliases(detail, {
			"@BookingFileCode": ["@BookingFileCode", "BookingFileCode"],
		}),
);
