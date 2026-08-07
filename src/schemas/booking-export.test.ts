import { parse, safeParse } from "../effect/schema-parse.js";
import { describe, expect, it } from "vitest";
import {
	ExportBookingDataApiSchema,
	ExportBookingDataResponseSchema,
} from "./booking-export.js";

describe("ExportBookingDataApiSchema", () => {
	it("puts LimitRange bounds on attributes", () => {
		const result = parse(ExportBookingDataApiSchema, {
			bookingFileCode: "14/036654",
			limitRange: { skip: 0, take: 100 },
		});

		expect(result).toEqual({
			BookingFileCode: "14/036654",
			LimitRange: { "@Skip": 0, "@Take": 100 },
		});
	});

	it("encodes date filters as MinDate/MaxDate attributes", () => {
		const result = parse(ExportBookingDataApiSchema, {
			startDate: { minDate: "2015-01-01", maxDate: "2015-01-10" },
		});

		expect(result).toEqual({
			StartDate: { "@MinDate": "2015-01-01", "@MaxDate": "2015-01-10" },
		});
	});

	it("wraps code filters as element lists, not attribute lists", () => {
		const result = parse(ExportBookingDataApiSchema, {
			statusLists: ["CONFIRMED", "QUOTATION"],
			featureCodeList: ["HTL"],
			packageCodeList: ["2014MDE0000010", "2014MDE0000011"],
		});

		expect(result).toEqual({
			StatusLists: { Status: ["CONFIRMED", "QUOTATION"] },
			FeatureCodeList: { Code: ["HTL"] },
			PackageCodeList: { Code: ["2014MDE0000010", "2014MDE0000011"] },
		});
	});

	it("accepts facade aliases for the AVES field names", () => {
		const result = parse(ExportBookingDataApiSchema, {
			bookingCode: "14/036654",
			customerCode: "138311",
			statuses: ["CONFIRMED"],
			packageCodes: ["2014MDE0000010"],
			passengerName: "ROSSI",
			limit: { skip: 0, take: 10 },
		});

		expect(result).toEqual({
			BookingFileCode: "14/036654",
			CustomerRecordCode: "138311",
			StatusLists: { Status: ["CONFIRMED"] },
			PackageCodeList: { Code: ["2014MDE0000010"] },
			FirstPassengerName: "ROSSI",
			LimitRange: { "@Skip": 0, "@Take": 10 },
		});
	});

	it("rejects a take above the documented 1000 ceiling", () => {
		const result = safeParse(ExportBookingDataApiSchema, {
			limitRange: { skip: 0, take: 1001 },
		});

		expect(result.success).toBe(false);
	});

	it("rejects a negative skip", () => {
		const result = safeParse(ExportBookingDataApiSchema, {
			limitRange: { skip: -1, take: 10 },
		});

		expect(result.success).toBe(false);
	});

	it("rejects an unknown booking file status filter", () => {
		const result = safeParse(ExportBookingDataApiSchema, {
			statusLists: ["NOT_A_STATUS"],
		});

		expect(result.success).toBe(false);
	});
});

/** Transcribed from the spec's worked example (Booking.txt:11702-11976). */
const specResponse = {
	RsStatus: { "@Status": "OK" },
	BookingFileList: {
		BookingFileData: {
			"@BookingFileCode": "2015    000080",
			Description: "CUMULA - PAX - NOTTI",
			BookingFileStatus: {
				"@Value": "CONFIRM",
				"@ExpiredDate": "2015-01-27T13:27:00+01:00",
			},
			LastModificationDate: "2015-03-05T10:07:48+01:00",
			CreationDate: "2015-01-27T00:00:00",
			StartDate: "2015-04-01T00:00:00",
			EndDate: "2015-04-01T00:00:00",
			CustomerRecordCode: "000001",
			FirstConfemationDate: "2015-01-27T00:00:00",
			BillingSubjectCode: "000001",
			CollectionSubjectCode: "000001",
			PaxNumber: "2",
			User: "HIS",
			Nation: "ITA",
			CurrencyCode: "EUR",
			PassengerList: {
				PassengerDetail: [
					{ "@RPH": "001", Name: "ADULTI 001", CategoryCode: "AD", Sex: "M" },
					{ "@RPH": "002", Name: "ADULTI 002", CategoryCode: "AD", Sex: "M" },
				],
			},
			BookedServices: {
				BookedServiceData: {
					"@RPH": "001",
					"@ServiceCode": "HA51-2    D01",
					AvesServiceType: "TOP",
					TOServiceType: "ACCOMODATION",
					FirstDescription: "DOPPIA",
					ServiceStatus: "ALLOTMENT",
					StartDate: "2015-04-01T00:00:00",
					EndDate: "2015-04-08T00:00:00",
					Exported: "false",
					ReceiptVatCode: "CE",
					CostVatCode: "CE",
					Qty: "1",
					Pax: "2",
					AmountsDetail: {
						"@ReceiptsWithTax": "280.000000",
						"@CostWithTax": "210.000000",
						"@CommissionOwed": "0.000000",
					},
					NoteList: {
						NoteDetail: {
							"@nType": "BOOKINGSERVICE_PROFORMA_INVOICE",
							"#text": "XML EXPORTATION",
						},
					},
				},
			},
			PaymentList: {
				PaymentDetail: {
					"@PaymentDate": "2015-03-05T10:07:02+01:00",
					"@PaymentNote": "",
					"@Amount": "11.000000",
					"@PaymentType": "C",
					"@PaymentUser": "HIS",
				},
			},
		},
	},
	ExtraInfo: {
		MasterDataSet: {
			MasterData: {
				"@RecordCode": "000001",
				RecordType: "NOT_SET",
				Name: "NOI",
			},
		},
		CurrencyList: {
			CurrencyDetail: { "@Code": "EUR", "@Description": "EURO" },
		},
		VatList: {
			VatDetail: [
				{ "@Code": "02", "@Rate": "22.000000", "@Description": "IVA" },
				{ "@Code": "CE", "@Rate": "0", "@Description": "ENTRO CE" },
			],
		},
		NationList: {
			NationDetail: {
				"@Code": "ITA",
				"@Name": "ITALIA",
				"@IsoCode": "IT",
				"@Territoriality": "IN_UE",
			},
		},
		UsersList: { UserDetail: { "@Code": "HIS", "@Description": "SYSADM" } },
	},
};

describe("ExportBookingDataResponseSchema", () => {
	it("parses the spec example into a flat camelCase booking file", () => {
		const result = parse(ExportBookingDataResponseSchema, specResponse);
		const [file] = result.bookingFileList ?? [];

		expect(result.rsStatus.status).toBe("OK");
		expect(file).toMatchObject({
			bookingFileCode: "2015    000080",
			description: "CUMULA - PAX - NOTTI",
			customerRecordCode: "000001",
			currencyCode: "EUR",
			paxNumber: "2",
		});
	});

	it("canonicalizes the CONFIRM status alias", () => {
		const result = parse(ExportBookingDataResponseSchema, specResponse);

		expect(result.bookingFileList?.[0]?.bookingFileStatus).toMatchObject({
			value: "CONFIRMED",
			expiredDate: "2015-01-27T13:27:00+01:00",
		});
	});

	it("normalizes the FirstConfemationDate misspelling", () => {
		const result = parse(ExportBookingDataResponseSchema, specResponse);
		const file = result.bookingFileList?.[0];

		expect(file?.firstConfirmationDate).toBe("2015-01-27T00:00:00");
		expect(file).not.toHaveProperty("firstConfemationDate");
	});

	it("returns registered payments — the read side of insertFilePaymentList", () => {
		const result = parse(ExportBookingDataResponseSchema, specResponse);

		expect(result.bookingFileList?.[0]?.paymentList).toEqual([
			{
				paymentDate: "2015-03-05T10:07:02+01:00",
				paymentNote: "",
				amount: "11.000000",
				paymentType: "C",
				paymentUser: "HIS",
			},
		]);
	});

	it("tolerates the PaumentNote misspelling on returned payments", () => {
		const result = parse(ExportBookingDataResponseSchema, {
			...specResponse,
			BookingFileList: {
				BookingFileData: {
					"@BookingFileCode": "2015    000080",
					PaymentList: {
						PaymentDetail: {
							"@PaumentNote": "acconto",
							"@Amount": "11.000000",
						},
					},
				},
			},
		});

		expect(result.bookingFileList?.[0]?.paymentList?.[0]).toEqual({
			paymentNote: "acconto",
			amount: "11.000000",
		});
	});

	it("flattens a single booked service and its amounts", () => {
		const result = parse(ExportBookingDataResponseSchema, specResponse);
		const [service] = result.bookingFileList?.[0]?.bookedServices ?? [];

		expect(service).toMatchObject({
			rph: "001",
			serviceCode: "HA51-2    D01",
			avesServiceType: "TOP",
			toServiceType: "ACCOMODATION",
			serviceStatus: "ALLOTMENT",
			qty: "1",
			pax: "2",
		});
		expect(service?.amountsDetail).toEqual({
			receiptsWithTax: "280.000000",
			costWithTax: "210.000000",
			commissionOwed: "0.000000",
		});
		expect(service?.noteList).toEqual([
			{ nType: "BOOKINGSERVICE_PROFORMA_INVOICE", text: "XML EXPORTATION" },
		]);
	});

	it("normalizes TOSubServiceType so it camelizes readably", () => {
		const result = parse(ExportBookingDataResponseSchema, {
			RsStatus: { "@Status": "OK" },
			BookingFileList: {
				BookingFileData: {
					"@BookingFileCode": "2015    000080",
					BookedServices: {
						BookedServiceData: {
							"@RPH": "001",
							TOSubServiceType: "BOARD_BASIS",
						},
					},
				},
			},
		});
		const [service] = result.bookingFileList?.[0]?.bookedServices ?? [];

		expect(service?.toSubServiceType).toBe("BOARD_BASIS");
		expect(service).not.toHaveProperty("tOSubServiceType");
	});

	it("exposes nation territoriality — the VAT regime input", () => {
		const result = parse(ExportBookingDataResponseSchema, specResponse);

		expect(result.extraInfo?.nationList).toEqual([
			{ code: "ITA", name: "ITALIA", isoCode: "IT", territoriality: "IN_UE" },
		]);
		expect(result.extraInfo?.vatList).toHaveLength(2);
	});

	it("accepts the UsersList spelling under the documented userList key", () => {
		const result = parse(ExportBookingDataResponseSchema, specResponse);

		expect(result.extraInfo?.userList).toEqual([
			{ code: "HIS", description: "SYSADM" },
		]);
		expect(result.extraInfo).not.toHaveProperty("usersList");
	});

	it("validates master data as records, accepting the NOT_SET record type", () => {
		const result = parse(ExportBookingDataResponseSchema, specResponse);

		// NOT_SET is absent from the request-side RecordType picklist; the
		// response-side RecordTypeWire adds it.
		expect(result.extraInfo?.masterDataSet).toEqual([
			{ recordCode: "000001", recordType: "NOT_SET", name: "NOI" },
		]);
	});

	it("rejects a record type outside the response picklist", () => {
		const result = safeParse(ExportBookingDataResponseSchema, {
			...specResponse,
			ExtraInfo: {
				MasterDataSet: {
					MasterData: { "@RecordCode": "000001", RecordType: "MADE_UP" },
				},
			},
		});

		expect(result.success).toBe(false);
	});

	it("validates the booked-service picklists strictly", () => {
		const service = {
			"@RPH": "001",
			SellingType: " ",
			Printable: "VOUCHER_AND_ONE_ROW_AND_ACCOMODATION_AND_TREATMENT",
			TOSubServiceType: "BOARD_BASIS",
		};
		const withService = (data: Record<string, unknown>) => ({
			RsStatus: { "@Status": "OK" },
			BookingFileList: {
				BookingFileData: {
					"@BookingFileCode": "X",
					BookedServices: { BookedServiceData: data },
				},
			},
		});

		const ok = parse(ExportBookingDataResponseSchema, withService(service));
		expect(ok.bookingFileList?.[0]?.bookedServices?.[0]).toMatchObject({
			// " " is a real SellingType value — "not specified", not an empty field.
			sellingType: " ",
			printable: "VOUCHER_AND_ONE_ROW_AND_ACCOMODATION_AND_TREATMENT",
			toSubServiceType: "BOARD_BASIS",
		});

		for (const bad of [
			{ ...service, SellingType: "X" },
			{ ...service, Printable: "MADE_UP" },
			{ ...service, TOSubServiceType: "MADE_UP" },
		]) {
			expect(
				safeParse(ExportBookingDataResponseSchema, withService(bad)).success,
			).toBe(false);
		}
	});

	it("parses deadlines, commissions and instalment plans", () => {
		const result = parse(ExportBookingDataResponseSchema, {
			RsStatus: { "@Status": "OK" },
			BookingFileList: {
				BookingFileData: {
					"@BookingFileCode": "X",
					CustomerProcessedPrintList: {
						ProcessedPrintDetail: {
							"@PrintType": "PROFORMA_INVOICE",
							"@PrintProtocol": "42",
						},
					},
					InstalmentPlanList: {
						InstalmentPlan: {
							"@Code": "P1",
							Instalments: {
								Instalment: { "@ExpiryDate": "2026-09-01", "@Amount": "50.00" },
							},
						},
					},
					SupplierInstalmentPlanList: {
						SupplierInstalmentPlan: {
							"@Code": "S1",
							"@SupplierMasterCode": "000204",
							SupplierInstalments: {
								SupplierInstalment: { "@Amount": "30.00" },
							},
						},
					},
					BookedServices: {
						BookedServiceData: {
							"@RPH": "001",
							DeadlineList: {
								DeadlineData: {
									DeadlineDetail: { "@Code": "D1", "@Status": "ToDo" },
								},
							},
							CommissionIncomeDetails: {
								"@Type": "NO_COMMISSION",
								"@Percentage": "0",
							},
							CommissionOwedDetails: { "@Type": "COMMISION", Amount: "5.00" },
						},
					},
				},
			},
		});
		const file = result.bookingFileList?.[0];
		const service = file?.bookedServices?.[0];

		expect(file?.customerProcessedPrintList?.[0]?.printType).toBe(
			"PROFORMA_INVOICE",
		);
		expect(file?.instalmentPlanList?.[0]?.instalments?.[0]?.amount).toBe(
			"50.00",
		);
		expect(
			file?.supplierInstalmentPlanList?.[0]?.supplierInstalments?.[0]?.amount,
		).toBe("30.00");
		expect(service?.deadlineList?.[0]?.deadlineDetail?.status).toBe("ToDo");
		expect(service?.commissionIncomeDetails?.type).toBe("NO_COMMISSION");
		// COMMISION keeps the AVES misspelling — it is the literal wire value.
		expect(service?.commissionOwedDetails?.type).toBe("COMMISION");
	});

	it("returns an empty booking list when AVES matches nothing", () => {
		const result = parse(ExportBookingDataResponseSchema, {
			RsStatus: { "@Status": "OK" },
			BookingFileList: {},
		});

		expect(result.bookingFileList).toEqual([]);
	});
});
