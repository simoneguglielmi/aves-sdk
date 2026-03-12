import { parse } from "valibot";
import { describe, expect, it } from "vitest";
import { createRootElement, XML_ROOT_ELEMENTS } from "../xml-root.js";
import {
	BookingFileApiSchema,
	BookingFileResponseSchema,
	BookingFileSchema,
} from "./booking-file.js";

describe("BookingFileSchema", () => {
	it("should validate minimal booking file (required fields only)", () => {
		const input = {
			customerDetail: { recordCode: "138311" },
			bookingFileStatus: { value: "QUOTATION" },
			startDate: "2014-12-27T00:00:00",
			endDate: "2015-01-03T00:00:00",
			selectedServiceList: [
				{
					selectedServiceDetail: {
						sCode: "VPARTENZUSTUT",
						avesServiceType: "TOP_SS",
						toServiceType: "TRANSPORT",
						startDate: "2014-12-27T00:00:00",
						endDate: "2015-01-03T00:00:00",
						qty: "1",
						pax: "1",
						paxAssociated: [],
						avesSession: "1",
					},
				},
			],
			passengerList: [
				{
					passengerDetail: {
						rph: "001",
						roomRph: "001",
						name: "ADULTO 001",
						categoryCode: "AD",
						sex: "M",
					},
				},
			],
		};

		const result = parse(BookingFileSchema, input);
		expect(result).toBeDefined();
		expect(result.customerDetail.recordCode).toBe("138311");
		expect(result.bookingFileStatus.value).toBe("QUOTATION");
		expect(result.selectedServiceList).toHaveLength(1);
		expect(result.passengerList).toHaveLength(1);
	});

	it("should validate single selectedServiceDetail (non-array)", () => {
		const input = {
			customerDetail: {},
			bookingFileStatus: { value: "WORK_IN_PROGRESS" },
			startDate: "2014-12-27T00:00:00",
			endDate: "2015-01-03T00:00:00",
			selectedServiceList: [
				{
					selectedServiceDetail: {
						sCode: "HT00109636",
						ssCode: "D02",
						avesServiceType: "TOP",
						toServiceType: "RESIDENCE",
						startDate: "2014-12-27T00:00:00",
						endDate: "2015-01-01T00:00:00",
						qty: "1",
						pax: "2",
						paxAssociated: [{ pax: "001" }, { pax: "002" }],
						avesSession: "3",
						avesServiceInfo: {
							packageCode: "2014MDE0000010",
							packageReference: "05",
						},
					},
				},
			],
			passengerList: [
				{
					passengerDetail: {
						rph: "001",
						roomRph: "001",
						name: "ADULT",
						categoryCode: "AD",
						sex: "M",
					},
				},
			],
		};

		const result = parse(BookingFileSchema, input);
		expect(result).toBeDefined();
		expect(result.selectedServiceList).toHaveLength(1);
		expect(result.passengerList).toHaveLength(1);
	});

	it("should reject invalid booking file status value", () => {
		const input = {
			customerDetail: { recordCode: "138311" },
			bookingFileStatus: { value: "INVALID_STATUS" },
			startDate: "2014-12-27T00:00:00",
			endDate: "2015-01-03T00:00:00",
			selectedServiceList: [{ selectedServiceDetail: { sCode: "S1" } }],
			passengerList: {
				passengerDetail: {
					rph: "001",
					roomRph: "001",
					name: "A",
					categoryCode: "AD",
				},
			},
		};

		expect(() => parse(BookingFileSchema, input)).toThrow();
	});

	it("should reject missing required startDate", () => {
		const input = {
			customerDetail: { recordCode: "138311" },
			bookingFileStatus: { value: "QUOTATION" },
			endDate: "2015-01-03T00:00:00",
			selectedServiceList: [{ selectedServiceDetail: { sCode: "S1" } }],
			passengerList: {
				passengerDetail: {
					rph: "001",
					roomRph: "001",
					name: "A",
					categoryCode: "AD",
				},
			},
		};

		expect(() => parse(BookingFileSchema, input)).toThrow();
	});
});

describe("BookingFileApiSchema", () => {
	it("should transform camelCase input to PascalCase with @ for attributes", () => {
		const input = {
			customerDetail: { recordCode: "138311" },
			bookingFileStatus: {
				value: "OPTIONED",
				expiredDate: "2014-09-26T23:59:00",
			},
			startDate: "2014-12-27T00:00:00",
			endDate: "2015-01-03T00:00:00",
			selectedServiceList: [
				{
					selectedServiceDetail: {
						sCode: "S1",
						avesServiceType: "TOP",
						toServiceType: "TRANSPORT",
						startDate: "2014-12-27T00:00:00",
						endDate: "2015-01-03T00:00:00",
						qty: "1",
						pax: "1",
						paxAssociated: [],
						avesSession: "1",
					},
				},
			],
			passengerList: [
				{
					passengerDetail: {
						rph: "001",
						roomRph: "001",
						name: "A",
						categoryCode: "AD",
						sex: "M",
					},
				},
			],
		};

		const result = parse(BookingFileApiSchema, input);
		expect(result).toBeDefined();
		expect(result.CustomerDetail).toBeDefined();
		expect(result.CustomerDetail).toHaveProperty("@RecordCode", "138311");
		expect(result.BookingFileStatus).toHaveProperty("@Value", "OPTIONED");
		expect(result.BookingFileStatus).toHaveProperty(
			"@ExpiredDate",
			"2014-09-26T23:59:00",
		);
		expect(result.StartDate).toBe("2014-12-27T00:00:00");
		expect(result.SelectedServiceList).toHaveLength(1);
		expect(result.SelectedServiceList[0].SelectedServiceDetail).toHaveProperty(
			"@sCode",
			"S1",
		);
		expect(result.PassengerList[0].PassengerDetail).toHaveProperty(
			"@RPH",
			"001",
		);
		expect(result.PassengerList[0].PassengerDetail).toHaveProperty(
			"@RoomRph",
			"001",
		);
	});
});

describe("BookingFileResponseSchema", () => {
	it("should parse OK response and transform to camelCase", () => {
		const apiResponse = {
			RsStatus: { "@Status": "OK" },
			BookingFileDetail: {
				"@BookingFileCode": "14/036657",
				CustomerRecordCode: "138311",
				BookingFileStatus: { "@Value": "QUOTATION" },
				StartDate: "2014-12-27T00:00:00",
				EndDate: "2015-01-03T00:00:00",
			},
		};

		const result = parse(BookingFileResponseSchema, apiResponse);
		expect(result).toBeDefined();
		expect(result.rsStatus).toBeDefined();
		expect(result.rsStatus.status).toBe("OK");
		expect(result.bookingFileDetail).toBeDefined();
		expect(result.bookingFileDetail).toHaveProperty(
			"bookingFileCode",
			"14/036657",
		);
		expect(result.bookingFileDetail).toHaveProperty(
			"customerRecordCode",
			"138311",
		);
		expect(result.bookingFileDetail).toHaveProperty(
			"startDate",
			"2014-12-27T00:00:00",
		);
	});

	it("should parse ERROR response", () => {
		const apiResponse = {
			RsStatus: {
				"@Status": "ERROR",
				ErrorCode: 2001,
				ErrorDescription: "Booking creation failed",
			},
		};

		const result = parse(BookingFileResponseSchema, apiResponse);
		expect(result).toBeDefined();
		expect(result.rsStatus.status).toBe("ERROR");
		expect(result.rsStatus.errorCode).toBe(2001);
		expect(result.rsStatus.errorDescription).toBe("Booking creation failed");
		expect(result.bookingFileDetail).toBeUndefined();
	});

	it("should accept response without BookingFileDetail", () => {
		const apiResponse = {
			RsStatus: { "@Status": "OK" },
		};

		const result = parse(BookingFileResponseSchema, apiResponse);
		expect(result.rsStatus.status).toBe("OK");
		expect(result.bookingFileDetail).toBeUndefined();
	});
});

describe("createBooking request shape (BookFileRQ)", () => {
	it("should build request with BookFileRQ root and RqHeader + transformed body", () => {
		const params = {
			customerDetail: { recordCode: "138311" },
			bookingFileStatus: { value: "QUOTATION" as const },
			startDate: "2014-12-27T00:00:00",
			endDate: "2015-01-03T00:00:00",
			selectedServiceList: [
				{
					selectedServiceDetail: {
						sCode: "S1",
						avesServiceType: "TOP",
						toServiceType: "TRANSPORT",
						startDate: "2014-12-27T00:00:00",
						endDate: "2015-01-03T00:00:00",
						qty: "1",
						pax: "1",
						paxAssociated: [],
						avesSession: "1",
					},
				},
			],
			passengerList: [
				{
					passengerDetail: {
						rph: "001",
						roomRph: "001",
						name: "Adult",
						categoryCode: "AD" as const,
						sex: "M",
					},
				},
			],
		};
		const apiBody = parse(BookingFileApiSchema, params);
		const rqHeader = {
			"@HostID": "025706",
			"@Xtoken": "TOKEN",
			"@Interface": "WEB",
			"@UserName": "WEB",
		};
		const requestBody = createRootElement(XML_ROOT_ELEMENTS.BOOKING_REQUEST, {
			RqHeader: rqHeader,
			...apiBody,
		});

		expect(Object.keys(requestBody)).toContain("BookFileRQ");
		const root = requestBody.BookFileRQ as Record<string, unknown>;
		expect(root.RqHeader).toEqual(rqHeader);
		expect(root.CustomerDetail).toBeDefined();
		expect(root.StartDate).toBe("2014-12-27T00:00:00");
		expect(root.PassengerList).toBeDefined();
	});
});
