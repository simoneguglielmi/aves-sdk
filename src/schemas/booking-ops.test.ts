import { describe, expect, it } from "vitest";
import { parse, safeParse } from "../effect/schema-parse.js";
import {
	BookingFileDetailResponseSchema,
	CancelFileApiSchema,
	CancelFileSchema,
	FilePaymentListApiSchema,
	FilePaymentListSchema,
	ModFileServicesApiSchema,
	ModFileServicesSchema,
	SetFileServiceStatusApiSchema,
	SetFileStatusApiSchema,
	SetFileStatusSchema,
} from "./booking-ops.js";
import { BookingFileDetailApiSchema } from "./booking-response.js";

const serviceDetail = {
	sCode: "HT00110840",
	ssCode: "DL",
	avesServiceType: "TOP" as const,
	toServiceType: "RESIDENCE" as const,
	startDate: "2015-01-22T00:00:00",
	endDate: "2015-01-25T00:00:00",
	qty: "1",
	pax: "2",
	avesSession: "1",
	bookedServiceRef: "001",
	serviceFare: {
		currencyCode: "EUR",
		cost: "100.00",
		price: "120.00",
	},
};

describe("ModFileServicesSchema", () => {
	it("should validate overwrite payload with package + delete + services", () => {
		const result = parse(ModFileServicesSchema, {
			customerRecordCode: "138311",
			bookingFileCode: "14/036654",
			selectedPackageDetail: {
				pCode: "2014MDE0000010",
				startDate: "2015-01-22T00:00:00",
				endDate: "2015-01-25T00:00:00",
			},
			cancellableBookedServiceList: [
				{
					cancelOperationType: "DELETE",
					serviceRefType: "RPH",
					serviceRefValue: "001",
				},
			],
			selectedServiceList: [serviceDetail],
		});
		expect(result).toMatchObject({
			bookingFileCode: "14/036654",
			selectedPackageDetail: { pCode: "2014MDE0000010" },
			cancellableBookedServiceList: [
				{
					cancelOperationType: "DELETE",
					serviceRefType: "RPH",
					serviceRefValue: "001",
				},
			],
			selectedServiceList: [serviceDetail],
		});
	});

	it("should reject empty selectedServiceList", () => {
		const result = safeParse(ModFileServicesSchema, {
			customerRecordCode: "138311",
			bookingFileCode: "14/036654",
			selectedServiceList: [],
		});
		expect(result.success).toBe(false);
	});

	it("should transform to PascalCase API body with attributes", () => {
		const api = parse(ModFileServicesApiSchema, {
			customerRecordCode: "138311",
			bookingFileCode: "14/036654",
			selectedPackageDetail: {
				pCode: "2014MDE0000010",
				startDate: "2015-01-22T00:00:00",
				endDate: "2015-01-25T00:00:00",
			},
			cancellableBookedServiceList: [
				{
					cancelOperationType: "NULLIFY",
					serviceRefType: "RPH",
					serviceRefValue: "002",
				},
			],
			selectedServiceList: [serviceDetail],
		});

		expect(api).toHaveProperty("CustomerRecordCode", "138311");
		expect(api).toHaveProperty("BookingFileCode", "14/036654");
		expect(api.SelectedPackageDetail).toMatchObject({
			"@pCode": "2014MDE0000010",
			"@StartDate": "2015-01-22T00:00:00",
			"@EndDate": "2015-01-25T00:00:00",
		});
		expect(api.CancellableBookedServiceList).toMatchObject({
			CancellableBookedServiceDetail: [
				{
					"@CancelOperationType": "NULLIFY",
					"@ServiceRefType": "RPH",
					"@ServiceRefValue": "002",
				},
			],
		});
		expect(api.SelectedServiceList).toMatchObject({
			SelectedServiceDetail: [
				{
					"@sCode": "HT00110840",
					"@ssCode": "DL",
					BookedServiceRef: "001",
					ServiceFare: {
						"@CurrencyCode": "EUR",
						"@Cost": "100.00",
						"@Price": "120.00",
					},
				},
			],
		});
	});
});

describe("CancelFileSchema / SetFileStatusSchema", () => {
	it("should transform cancel request", () => {
		const api = parse(CancelFileApiSchema, {
			bookingFileCode: "14/000081",
			customerRecordCode: "000170",
		});
		expect(api).toEqual({
			BookingFileCode: "14/000081",
			CustomerRecordCode: "000170",
		});
	});

	it("should validate and transform set status with CANCELED", () => {
		const result = parse(SetFileStatusSchema, {
			customerRecordCode: "000170",
			bookingFileCode: "14/000081",
			fileStatus: { value: "CANCELED" },
			backOfficeRequest: true,
		});
		expect(result.fileStatus.value).toBe("CANCELED");

		const api = parse(SetFileStatusApiSchema, result);
		expect(api.FileStatus).toMatchObject({ "@Value": "CANCELED" });
		expect(api.BackOfficeRequest).toBe(true);
	});

	it("should transform set service status NULLIFIED", () => {
		const api = parse(SetFileServiceStatusApiSchema, {
			customerRecordCode: "000001",
			bookingFileCode: "18/000252",
			bookingServiceRef: "002",
			bookingFileServiceStatus: "NULLIFIED",
			bookingFileServiceStatusDate: "2018-11-29T12:50:00+01:00",
		});
		expect(api).toMatchObject({
			CustomerRecordCode: "000001",
			BookingFileCode: "18/000252",
			BookingServiceRef: "002",
			BookingFileServiceStatus: "NULLIFIED",
		});
	});

	it("should reject cancel without bookingFileCode", () => {
		const result = safeParse(CancelFileSchema, {
			customerRecordCode: "000170",
		});
		expect(result.success).toBe(false);
	});
});

describe("BookingFileDetailApiSchema (typed response)", () => {
	it("should parse BOOKEDFILE response shape and normalize one service", () => {
		const parsed = parse(BookingFileDetailApiSchema, {
			"@BookingFileCode": "14/036657",
			CustomerRecordCode: "138311",
			BookingFileStatus: { "@Value": "QUOTATION" },
			StartDate: "2014-12-27T00:00:00",
			EndDate: "2015-01-03T00:00:00",
			PackageCode: "14/MDE0000010",
			BookedServiceList: {
				BookedServiceDetail: {
					"@RPH": "001",
					"@ServiceCode": "HT00109636D02",
					AvesServiceType: "TOP",
					TOServiceType: "RESIDENCE",
					ServiceStatus: "REQUEST",
					ServiceTotalAmountDetail: {
						"@CostListCode": "G",
						"@ServiceTotalPrice": "100.00",
						PaxPriceList: {
							PricePerPaxDetail: { "@PaxRef": "001", "@Price": "50.00" },
						},
					},
				},
			},
			TotalAmountDetail: {
				"@CurrencyCode": "EUR",
				"@DueAmount": "100.00",
				"@Balance": "100.00",
			},
			PassengerList: {
				PassengerDetail: {
					"@RPH": "001",
					Name: "ADULTI 001",
					Sex: "M",
				},
			},
		});

		expect(parsed["@BookingFileCode"]).toBe("14/036657");
		expect(parsed.BookedServiceList).toHaveLength(1);
		expect(parsed.BookedServiceList?.[0]["@RPH"]).toBe("001");
		expect(
			parsed.BookedServiceList?.[0].ServiceTotalAmountDetail?.PaxPriceList,
		).toHaveLength(1);
	});

	it("should normalize wire dialects to a single camelCase contract", () => {
		const result = parse(BookingFileDetailResponseSchema, {
			RsStatus: { "@Status": "OK" },
			BookingFileDetail: {
				BookingFileCode: "14/036657",
				CustomerRecordCode: "138311",
				BookingFileStatus: { "@Value": "CONFIRM" },
				BookedServiceList: {
					BookedServiceDetail: [
						{
							"@RPH": "001",
							"@ServiceCode": "S1",
							"@isFromExternalProvider": "false",
							ServiceStatus: "NULLIFIED",
						},
					],
				},
			},
		});

		expect(result.rsStatus.status).toBe("OK");
		expect(result.bookingFileCode).toBe("14/036657");
		expect(result.bookingFileStatus?.value).toBe("CONFIRMED");
		expect(result.bookedServiceList?.[0].rph).toBe("001");
		expect(result.bookedServiceList?.[0].fromExternalProvider).toBe("false");
	});
});

describe("FilePaymentListSchema", () => {
	it("should validate AbsoluteAmountsInsertion payload", () => {
		const result = parse(FilePaymentListSchema, {
			bookingFileCode: "18/000172",
			paymentUser: "MLDN",
			enableMultiplePayments: true,
			operationType: "AbsoluteAmountsInsertion",
			filePaymentList: [
				{
					paymentDate: "2018-09-08",
					paymentNote: "INCASSO",
					amount: "100.00",
					paymentType: "B",
				},
				{
					paymentDate: "2018-10-08",
					paymentNote: "INCASSO",
					amount: "800.25",
					paymentType: "C",
				},
			],
		});
		expect(result).toMatchObject({
			bookingFileCode: "18/000172",
			filePaymentList: [
				{
					paymentDate: "2018-09-08",
					paymentNote: "INCASSO",
					amount: "100.00",
					paymentType: "B",
				},
				{
					paymentDate: "2018-10-08",
					paymentNote: "INCASSO",
					amount: "800.25",
					paymentType: "C",
				},
			],
		});
	});

	it("should require bookingFileCode or bookingFileRefCode", () => {
		const result = safeParse(FilePaymentListSchema, {
			enableMultiplePayments: true,
			operationType: "AbsoluteAmountsInsertion",
			filePaymentList: [
				{
					paymentDate: "2018-09-08",
					amount: "100.00",
					paymentType: "B",
				},
			],
		});
		expect(result.success).toBe(false);
	});

	it("should transform to PascalCase with payment attributes", () => {
		const api = parse(FilePaymentListApiSchema, {
			bookingFileCode: "18/000172",
			paymentUser: "MLDN",
			enableMultiplePayments: true,
			operationType: "AbsoluteAmountsInsertion",
			filePaymentList: [
				{
					paymentDate: "2018-09-08",
					paymentNote: "INCASSO",
					amount: "100.00",
					paymentType: "B",
				},
			],
		});
		expect(api).toMatchObject({
			BookingFileCode: "18/000172",
			"@PaymentUser": "MLDN",
			EnableMultiplePayments: true,
			OperationType: "AbsoluteAmountsInsertion",
			FilePaymentList: {
				FilePaymentDetail: [
					{
						"@PaymentDate": "2018-09-08",
						"@PaymentNote": "INCASSO",
						"@Amount": "100.00",
						"@PaymentType": "B",
					},
				],
			},
		});
	});
});
