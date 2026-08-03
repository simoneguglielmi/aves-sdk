import { parse, safeParse } from "valibot";
import { describe, expect, it } from "vitest";
import {
	AvesSearchApiSchema,
	AvesSearchSchema,
	CommitPackageApiSchema,
	PackageDetailRequestApiSchema,
	PackageDetailRequestSchema,
	SearchPackageResponseSchema,
} from "./package-catalog.js";
import {
	SearchBookingFileApiSchema,
	SearchBookingFileSchema,
} from "./search-booking-file.js";

const passengers = [
	{
		rph: "001",
		roomRph: "001",
		name: "ADULTI 001",
		categoryCode: "AD" as const,
		sex: "M" as const,
		birthDate: "0001-01-01T00:00:00",
	},
	{
		rph: "002",
		roomRph: "001",
		name: "ADULTI 002",
		categoryCode: "AD" as const,
		sex: "M" as const,
		birthDate: "0001-01-01T00:00:00",
	},
];

describe("AvesSearchSchema", () => {
	it("should transform flat search with element dates in BaseSearch", () => {
		const api = parse(AvesSearchApiSchema, {
			customerRecordCode: "138311",
			languageCode: "01",
			currencyCode: "EUR",
			startDate: "2014-12-27T00:00:00",
			endDate: "2015-01-03T00:00:00",
			passengerList: passengers,
			avesSearchType: "PACKAGE",
			discartNotAvailables: false,
			objectTypeCode: "VIAGGIO",
			servOrPackCode: "2014MDE0000010",
			statisticCodes: { sCode2: "USA", sCode5: "IND" },
			packageParams: {
				getAllDeptDate: true,
				getFlightPlan: true,
				getAllAccomodation: true,
				getRealAvailability: false,
				minStay: 4,
				maxStay: 13,
			},
		});

		expect(api.BaseSearch).toMatchObject({
			CustomerRecordCode: "138311",
			LanguageCode: "01",
			StartDate: "2014-12-27T00:00:00",
			EndDate: "2015-01-03T00:00:00",
		});
		expect(api.BaseSearch).not.toHaveProperty("@StartDate");
		expect(api.AvesSearchType).toBe("PACKAGE");
		expect(api.PaxQty).toBe(2);
		expect(api.PaxQtyCriteria).toBe("GREATER_OR_EQUAL");
		expect(api.ServOrPackCode).toBe("2014MDE0000010");
		expect(api.PackageParams).toMatchObject({
			"@GetAllDeptDate": true,
			"@GetFlightPlan": true,
			MinStay: 4,
			MaxStay: 13,
		});
		expect(api.StatisticCodes).toMatchObject({
			"@sCode2": "USA",
			"@sCode5": "IND",
		});
		expect(api.BaseSearch.PassengerList).toMatchObject({
			PassengerDetail: [
				{ "@RPH": "001", Name: "ADULTI 001", CategoryCode: "AD" },
				{ "@RPH": "002", Name: "ADULTI 002", CategoryCode: "AD" },
			],
		});
	});

	it("should reject missing passengers", () => {
		const result = safeParse(AvesSearchSchema, {
			customerRecordCode: "138311",
			languageCode: "01",
			startDate: "2015-01-01",
			endDate: "2015-01-05",
			passengerList: [],
			avesSearchType: "PACKAGE",
		});
		expect(result.success).toBe(false);
	});

	it("should reject missing languageCode", () => {
		const result = safeParse(AvesSearchApiSchema, {
			customerRecordCode: "138311",
			startDate: "2015-01-01",
			endDate: "2015-01-05",
			passengerList: passengers,
			avesSearchType: "PACKAGE",
		});
		expect(result.success).toBe(false);
	});
});

describe("PackageDetailRequestSchema", () => {
	it("should transform with element dates and service attrs", () => {
		const api = parse(PackageDetailRequestApiSchema, {
			customerRecordCode: "001692",
			currencyCode: "EUR",
			packageCode: "2015F042",
			startDate: "2015-05-02T00:00:00",
			endDate: "2015-05-05T00:00:00",
			selectedServiceList: [
				{ serviceCode: "PFRM04    PAR", packageRow: "01" },
				{ serviceCode: "QFRM042", packageRow: "02" },
			],
			passengerList: passengers,
		});

		expect(api).toMatchObject({
			CustomerRecordCode: "001692",
			PackageCode: "2015F042",
			StartDate: "2015-05-02T00:00:00",
			EndDate: "2015-05-05T00:00:00",
		});
		expect(api).not.toHaveProperty("@StartDate");
		expect(api.SelectedServiceList).toMatchObject({
			SelectedServiceDetail: [
				{ "@ServiceCode": "PFRM04    PAR", "@PackageRow": "01" },
				{ "@ServiceCode": "QFRM042", "@PackageRow": "02" },
			],
		});
	});

	it("should reject empty selectedServiceList", () => {
		const result = safeParse(PackageDetailRequestSchema, {
			customerRecordCode: "001692",
			packageCode: "2015F042",
			startDate: "2015-05-02",
			endDate: "2015-05-05",
			selectedServiceList: [],
		});
		expect(result.success).toBe(false);
	});
});

describe("CommitPackageApiSchema", () => {
	it("should transform packageCode", () => {
		expect(
			parse(CommitPackageApiSchema, { packageCode: "14/PACKAGE001" }),
		).toEqual({
			PackageCode: "14/PACKAGE001",
		});
	});
});

describe("SearchPackageResponseSchema", () => {
	it("should parse package list to camelCase", () => {
		const result = parse(SearchPackageResponseSchema, {
			RsStatus: { "@Status": "OK" },
			PackageList: {
				PackageDetail: {
					"@pCode": "2015F041",
					FirstDescription: "FANTASIA 4 DAYS",
					CanCommitPack: "false",
					ServiceList: {
						ServiceDetail: {
							"@sCode": "QFRM04",
							RefPackageInfo: {
								"@PackageReference": "02",
								"@PackageServiceType": "DISPON1",
							},
						},
					},
				},
			},
		});

		expect(result.rsStatus.status).toBe("OK");
		expect(result.packageList?.[0]).toMatchObject({
			pCode: "2015F041",
			firstDescription: "FANTASIA 4 DAYS",
		});
		expect(result.packageList?.[0]?.serviceList?.[0]).toMatchObject({
			sCode: "QFRM04",
			refPackageInfo: {
				packageReference: "02",
				packageServiceType: "DISPON1",
			},
		});
	});
});

describe("SearchBookingFileSchema", () => {
	it("should transform PACKAGE_CODE search", () => {
		const api = parse(SearchBookingFileApiSchema, {
			searchType: "PACKAGE_CODE",
			customerRecordCode: "138311",
			packageCode: "2014MDE0000010",
		});
		expect(api).toEqual({
			SearchType: "PACKAGE_CODE",
			CustomerRecordCode: "138311",
			PackageCode: "2014MDE0000010",
		});
	});

	it("should transform OTHER search with date range attrs", () => {
		const api = parse(SearchBookingFileApiSchema, {
			searchType: "OTHER",
			customerRecordCode: "138311",
			startDate: { minDate: "2015-01-01", maxDate: "2015-01-31" },
			fileStatus: { value: "CONFIRMED" },
		});
		expect(api).toMatchObject({
			SearchType: "OTHER",
			StartDate: { "@MinDate": "2015-01-01", "@MaxDate": "2015-01-31" },
			FileStatus: { "@Value": "CONFIRMED" },
		});
	});

	it("should reject FILE_CODE without bookingFileCode", () => {
		const result = safeParse(SearchBookingFileSchema, {
			searchType: "FILE_CODE",
			customerRecordCode: "138311",
		});
		expect(result.success).toBe(false);
	});
});
