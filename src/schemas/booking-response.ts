import * as v from "valibot";
import { oneOrMany } from "../utils/schema-transform.js";
import {
	AvesServiceTypeSchema,
	BookedServiceStatusSchema,
	BookingFileStatusWireSchema,
	canonicalizeBookingFileStatus,
	ToServiceTypeSchema,
} from "./booking-shared.js";

const stringish = v.union([v.string(), v.number()]);

/** BookingFileStatus in BOOKEDFILE responses — aliases normalized to canonical values */
export const BookingFileStatusApiSchema = v.pipe(
	v.object({
		"@Value": BookingFileStatusWireSchema,
		"@ExpiredDate": v.optional(v.string()),
		"@ExpireDate": v.optional(v.string()),
	}),
	v.transform((status) => ({
		"@Value": canonicalizeBookingFileStatus(status["@Value"]),
		"@ExpiredDate": status["@ExpiredDate"] ?? status["@ExpireDate"],
	})),
);

export const PricePerPaxDetailApiSchema = v.object({
	"@PaxRef": v.string(),
	"@Price": stringish,
});

export const PaxPriceListApiSchema = v.object({
	PricePerPaxDetail: v.optional(oneOrMany(PricePerPaxDetailApiSchema)),
});

export const ServiceTotalAmountDetailApiSchema = v.object({
	"@CommissionCode": v.optional(v.string()),
	"@CommissionPercentage": v.optional(stringish),
	"@CommissionAmount": v.optional(stringish),
	"@PriceListCode": v.optional(v.string()),
	"@CostListCode": v.optional(v.string()),
	"@ServiceTotalPrice": v.optional(stringish),
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
	"@FromExternalProvider": v.optional(stringish),
	"@isFromExternalProvider": v.optional(stringish),
	AvesServiceType: v.optional(AvesServiceTypeSchema),
	TOServiceType: v.optional(ToServiceTypeSchema),
	FirstDescription: v.optional(v.string()),
	SecondDescription: v.optional(v.string()),
	ThirdDescription: v.optional(v.string()),
	FourthDescription: v.optional(v.string()),
	ServiceStatus: v.optional(BookedServiceStatusSchema),
	StartDate: v.optional(v.string()),
	EndDate: v.optional(v.string()),
	Qty: v.optional(stringish),
	Pax: v.optional(stringish),
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
	v.transform((service) => ({
		"@RPH": service["@RPH"],
		"@ServiceCode": service["@ServiceCode"],
		"@FromExternalProvider":
			service["@FromExternalProvider"] ?? service["@isFromExternalProvider"],
		AvesServiceType: service.AvesServiceType,
		TOServiceType: service.TOServiceType,
		FirstDescription: service.FirstDescription,
		SecondDescription: service.SecondDescription,
		ThirdDescription: service.ThirdDescription,
		FourthDescription: service.FourthDescription,
		ServiceStatus: service.ServiceStatus,
		StartDate: service.StartDate,
		EndDate: service.EndDate,
		Qty: service.Qty,
		Pax: service.Pax,
		PeriodType: service.PeriodType,
		PaxMultiplier: service.PaxMultiplier,
		ExternalProviderCode: service.ExternalProviderCode,
		WebStatisticCode: service.WebStatisticCode,
		WebStatisticDescription: service.WebStatisticDescription,
		WebStatistic: service.WebStatistic,
		SupplierInfo: service.SupplierInfo,
		ServiceTotalAmountDetail: service.ServiceTotalAmountDetail,
	})),
);

export const BookedServiceListApiSchema = v.object({
	BookedServiceDetail: v.optional(oneOrMany(BookedServiceDetailApiSchema)),
});

/** TotalAmountDetail — attributes on BOOKEDFILE */
export const TotalAmountDetailApiSchema = v.object({
	"@CurrencyCode": v.optional(v.string()),
	"@TotalAmountBeforeDiscount": v.optional(stringish),
	"@TotalAmountAfterDiscount": v.optional(stringish),
	"@TotalDiscount": v.optional(stringish),
	"@TotalAmountWithoutVat": v.optional(stringish),
	"@DueAmount": v.optional(stringish),
	"@PaiedAmount": v.optional(stringish),
	"@Balance": v.optional(stringish),
});

export const PassengerDetailApiSchema = v.object({
	"@RPH": v.string(),
	"@RoomRPH": v.optional(v.string()),
	"@BillingHolder": v.optional(stringish),
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

export const PassengerListApiSchema = v.object({
	PassengerDetail: v.optional(oneOrMany(PassengerDetailApiSchema)),
});

const FinancialDeadlineDetailWireSchema = v.object({
	"@ReschedulingCode": v.optional(v.string()),
	"@ExpireDate": v.optional(v.string()),
	"@TotalAmount": v.optional(stringish),
	ReschedulingCode: v.optional(v.string()),
	ExpireDate: v.optional(v.string()),
	TotalAmount: v.optional(stringish),
});

export const FinancialDeadlineDetailApiSchema = v.pipe(
	FinancialDeadlineDetailWireSchema,
	v.transform((deadline) => ({
		"@ReschedulingCode":
			deadline["@ReschedulingCode"] ?? deadline.ReschedulingCode,
		"@ExpireDate": deadline["@ExpireDate"] ?? deadline.ExpireDate,
		"@TotalAmount": deadline["@TotalAmount"] ?? deadline.TotalAmount,
	})),
);

export const FinancialDeadlineListApiSchema = v.object({
	DeadlineDetail: v.optional(oneOrMany(FinancialDeadlineDetailApiSchema)),
});

export const StoredDocumentDetailApiSchema = v.object({
	DocumentRefCode: v.optional(v.string()),
	DocumentType: v.optional(v.string()),
	DocumentName: v.optional(v.string()),
	ArchiviationDescription: v.optional(v.string()),
});

export const StoredDocumentsListApiSchema = v.object({
	StoredDocumentDetail: v.optional(oneOrMany(StoredDocumentDetailApiSchema)),
});

export const PrintableDocumentDetailApiSchema = v.object({
	DocumentType: v.optional(v.string()),
	DocumentName: v.optional(v.string()),
	Enabled: v.optional(stringish),
});

export const PrintableDocumentsListApiSchema = v.object({
	PrintableDocumentDetail: v.optional(
		oneOrMany(PrintableDocumentDetailApiSchema),
	),
});

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
	PaxNumber: v.optional(stringish),
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
 */
export const BookingFileDetailApiSchema = v.pipe(
	BookingFileDetailWireSchema,
	v.transform((detail) => ({
		"@BookingFileCode": detail["@BookingFileCode"] ?? detail.BookingFileCode,
		CustomerRecordCode: detail.CustomerRecordCode,
		CustomerName: detail.CustomerName,
		CustomerEmail: detail.CustomerEmail,
		TravelAgencyName: detail.TravelAgencyName,
		TravelAgencyEmail: detail.TravelAgencyEmail,
		BookingFileStatus: detail.BookingFileStatus,
		Description: detail.Description,
		Nation: detail.Nation,
		Destination: detail.Destination,
		CreationDate: detail.CreationDate,
		FirstConfirmationDate: detail.FirstConfirmationDate,
		StartDate: detail.StartDate,
		EndDate: detail.EndDate,
		PackageCode: detail.PackageCode,
		BookedServiceList: detail.BookedServiceList,
		TotalAmountDetail: detail.TotalAmountDetail,
		PaxNumber: detail.PaxNumber,
		PassengerList: detail.PassengerList,
		Reference: detail.Reference,
		ClerkName: detail.ClerkName,
		StoredDocumentsList: detail.StoredDocumentsList,
		PrintableDocumentsList: detail.PrintableDocumentsList,
		FinancialDeadlineList: detail.FinancialDeadlineList,
	})),
);
