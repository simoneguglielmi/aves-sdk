import * as v from "valibot";
import {
	coalesceWireAliases,
	listDetailApiSchema,
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
export const BookingFileStatusApiSchema = v.pipe(
	v.object({
		"@Value": BookingFileStatusWireSchema,
		"@ExpiredDate": v.optional(v.string()),
		"@ExpireDate": v.optional(v.string()),
	}),
	v.transform((status) => ({
		...coalesceWireAliases(status, {
			"@ExpiredDate": ["@ExpiredDate", "@ExpireDate"],
		}),
		"@Value": canonicalizeBookingFileStatus(status["@Value"]),
	})),
);

export const PricePerPaxDetailApiSchema = v.object({
	"@PaxRef": v.string(),
	"@Price": StringishSchema,
});

export const PaxPriceListApiSchema = listDetailApiSchema(
	"PricePerPaxDetail",
	PricePerPaxDetailApiSchema,
);

export const ServiceTotalAmountDetailApiSchema = v.object({
	"@CommissionCode": v.optional(v.string()),
	"@CommissionPercentage": v.optional(StringishSchema),
	"@CommissionAmount": v.optional(StringishSchema),
	"@PriceListCode": v.optional(v.string()),
	"@CostListCode": v.optional(v.string()),
	"@ServiceTotalPrice": v.optional(StringishSchema),
	PaxPriceList: v.optional(PaxPriceListApiSchema),
});

export const SupplierInfoApiSchema = v.object({
	"@Code": v.optional(v.string()),
	"@Name": v.optional(v.string()),
	"@Email": v.optional(v.string()),
	"@LanguageCode": v.optional(v.string()),
});

export const WebStatisticApiSchema = v.object({
	"@Code": v.optional(v.string()),
	"@Description": v.optional(v.string()),
});

/** Wire schema — accepts AVES dialect aliases, then normalizes */
const BookedServiceDetailWireSchema = v.object({
	"@RPH": v.string(),
	"@ServiceCode": v.optional(v.string()),
	"@FromExternalProvider": v.optional(StringishSchema),
	"@isFromExternalProvider": v.optional(StringishSchema),
	AvesServiceType: v.optional(AvesServiceTypeSchema),
	TOServiceType: v.optional(ToServiceTypeSchema),
	FirstDescription: v.optional(v.string()),
	SecondDescription: v.optional(v.string()),
	ThirdDescription: v.optional(v.string()),
	FourthDescription: v.optional(v.string()),
	ServiceStatus: v.optional(BookedServiceStatusSchema),
	StartDate: v.optional(v.string()),
	EndDate: v.optional(v.string()),
	Qty: v.optional(StringishSchema),
	Pax: v.optional(StringishSchema),
	PeriodType: v.optional(v.string()),
	PaxMultiplier: v.optional(v.string()),
	ExternalProviderCode: v.optional(v.string()),
	WebStatisticCode: v.optional(v.string()),
	WebStatisticDescription: v.optional(v.string()),
	WebStatistic: v.optional(WebStatisticApiSchema),
	SupplierInfo: v.optional(SupplierInfoApiSchema),
	ServiceTotalAmountDetail: v.optional(ServiceTotalAmountDetailApiSchema),
});

/** BookedServiceDetail — single fromExternalProvider after normalize */
export const BookedServiceDetailApiSchema = v.pipe(
	BookedServiceDetailWireSchema,
	v.transform((service) =>
		coalesceWireAliases(service, {
			"@FromExternalProvider": [
				"@FromExternalProvider",
				"@isFromExternalProvider",
			],
		}),
	),
);

export const BookedServiceListApiSchema = listDetailApiSchema(
	"BookedServiceDetail",
	BookedServiceDetailApiSchema,
);

/** TotalAmountDetail — attributes on BOOKEDFILE */
export const TotalAmountDetailApiSchema = v.object({
	"@CurrencyCode": v.optional(v.string()),
	"@TotalAmountBeforeDiscount": v.optional(StringishSchema),
	"@TotalAmountAfterDiscount": v.optional(StringishSchema),
	"@TotalDiscount": v.optional(StringishSchema),
	"@TotalAmountWithoutVat": v.optional(StringishSchema),
	"@DueAmount": v.optional(StringishSchema),
	"@PaiedAmount": v.optional(StringishSchema),
	"@Balance": v.optional(StringishSchema),
});

export const PassengerDetailApiSchema = v.object({
	"@RPH": v.string(),
	"@RoomRPH": v.optional(v.string()),
	"@BillingHolder": v.optional(StringishSchema),
	Name: v.optional(v.string()),
	CategoryCode: v.optional(v.string()),
	Sex: v.optional(v.string()),
	BirthDate: v.optional(v.string()),
	BirthPlace: v.optional(v.string()),
	NationCode: v.optional(v.string()),
	CitizenshipCode: v.optional(v.string()),
	FiscalCode: v.optional(v.string()),
	PhoneNumber: v.optional(v.string()),
	EMail: v.optional(v.string()),
	MasterRecordCode: v.optional(v.string()),
});

export const PassengerListApiSchema = listDetailApiSchema(
	"PassengerDetail",
	PassengerDetailApiSchema,
);

const FinancialDeadlineDetailWireSchema = v.object({
	"@ReschedulingCode": v.optional(v.string()),
	"@ExpireDate": v.optional(v.string()),
	"@TotalAmount": v.optional(StringishSchema),
	ReschedulingCode: v.optional(v.string()),
	ExpireDate: v.optional(v.string()),
	TotalAmount: v.optional(StringishSchema),
});

export const FinancialDeadlineDetailApiSchema = v.pipe(
	FinancialDeadlineDetailWireSchema,
	v.transform((deadline) =>
		coalesceWireAliases(deadline, {
			"@ReschedulingCode": ["@ReschedulingCode", "ReschedulingCode"],
			"@ExpireDate": ["@ExpireDate", "ExpireDate"],
			"@TotalAmount": ["@TotalAmount", "TotalAmount"],
		}),
	),
);

export const FinancialDeadlineListApiSchema = listDetailApiSchema(
	"DeadlineDetail",
	FinancialDeadlineDetailApiSchema,
);

export const StoredDocumentDetailApiSchema = v.object({
	DocumentRefCode: v.optional(v.string()),
	DocumentType: v.optional(v.string()),
	DocumentName: v.optional(v.string()),
	ArchiviationDescription: v.optional(v.string()),
});

export const StoredDocumentsListApiSchema = listDetailApiSchema(
	"StoredDocumentDetail",
	StoredDocumentDetailApiSchema,
);

export const PrintableDocumentDetailApiSchema = v.object({
	DocumentType: v.optional(v.string()),
	DocumentName: v.optional(v.string()),
	Enabled: v.optional(StringishSchema),
});

export const PrintableDocumentsListApiSchema = listDetailApiSchema(
	"PrintableDocumentDetail",
	PrintableDocumentDetailApiSchema,
);

const BookingFileDetailWireSchema = v.object({
	"@BookingFileCode": v.optional(v.string()),
	BookingFileCode: v.optional(v.string()),
	CustomerRecordCode: v.optional(v.string()),
	CustomerName: v.optional(v.string()),
	CustomerEmail: v.optional(v.string()),
	TravelAgencyName: v.optional(v.string()),
	TravelAgencyEmail: v.optional(v.string()),
	BookingFileStatus: v.optional(BookingFileStatusApiSchema),
	Description: v.optional(v.string()),
	Nation: v.optional(v.string()),
	Destination: v.optional(v.string()),
	CreationDate: v.optional(v.string()),
	FirstConfirmationDate: v.optional(v.string()),
	StartDate: v.optional(v.string()),
	EndDate: v.optional(v.string()),
	PackageCode: v.optional(v.string()),
	BookedServiceList: v.optional(BookedServiceListApiSchema),
	TotalAmountDetail: v.optional(TotalAmountDetailApiSchema),
	PaxNumber: v.optional(StringishSchema),
	PassengerList: v.optional(PassengerListApiSchema),
	Reference: v.optional(v.string()),
	ClerkName: v.optional(v.string()),
	StoredDocumentsList: v.optional(StoredDocumentsListApiSchema),
	PrintableDocumentsList: v.optional(PrintableDocumentsListApiSchema),
	FinancialDeadlineList: v.optional(FinancialDeadlineListApiSchema),
});

/**
 * BookingFileDetail — Common Structures "BOOKEDFILE".
 * Accepts wire dialects, normalizes to a single PascalCase/@attr shape for camelCase mapping.
 * Nested `*List` fields are already flat Detail arrays.
 */
export const BookingFileDetailApiSchema = v.pipe(
	BookingFileDetailWireSchema,
	v.transform((detail) =>
		coalesceWireAliases(detail, {
			"@BookingFileCode": ["@BookingFileCode", "BookingFileCode"],
		}),
	),
);
