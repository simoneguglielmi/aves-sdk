import { describe, expect, it } from "vitest";
import { parse } from "../effect/schema-parse.js";
import { jsonToXml } from "../xml/client.js";
import { createRootElement, XML_ROOT_ELEMENTS } from "../xml/root.js";
import {
	BookingFileApiSchema,
	BookingFileResponseSchema,
	BookingFileSchema,
} from "./booking-file.js";

const serviceDetail = {
	sCode: "VPARTENZUSTUT",
	avesServiceType: "TOP_SS" as const,
	toServiceType: "TRANSPORT" as const,
	startDate: "2014-12-27T00:00:00",
	endDate: "2015-01-03T00:00:00",
	qty: "1",
	pax: "1",
	paxAssociated: [] as { pax: string }[],
	avesSession: "1",
};

const passengerDetail = {
	rph: "001",
	roomRph: "001",
	name: "ADULTO 001",
	categoryCode: "AD" as const,
	sex: "M" as const,
};

describe("BookingFileSchema", () => {
	it("should validate minimal booking file (required fields only)", () => {
		const result = parse(BookingFileSchema, {
			customerDetail: { recordCode: "138311" },
			bookingFileStatus: { value: "QUOTATION" },
			startDate: "2014-12-27T00:00:00",
			endDate: "2015-01-03T00:00:00",
			selectedServiceList: [serviceDetail],
			passengerList: [passengerDetail],
		});
		expect(result).toMatchObject({
			customerDetail: { recordCode: "138311" },
			bookingFileStatus: { value: "QUOTATION" },
			selectedServiceList: [serviceDetail],
			passengerList: [passengerDetail],
		});
	});

	it("should keep selectedServiceList as flat Detail array", () => {
		const result = parse(BookingFileSchema, {
			customerDetail: {},
			bookingFileStatus: { value: "WORK_IN_PROGRESS" },
			startDate: "2014-12-27T00:00:00",
			endDate: "2015-01-03T00:00:00",
			selectedServiceList: [
				{
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
			],
			passengerList: [
				{
					rph: "001",
					roomRph: "001",
					name: "ADULT",
					categoryCode: "AD",
					sex: "M",
				},
			],
		});
		expect(result.selectedServiceList[0].ssCode).toBe("D02");
	});

	it("should accept toServiceType: TOUR — real SearchServicesRS wire dialect (Booking.txt:4207), added beyond the documented 13-value table", () => {
		const result = parse(BookingFileSchema, {
			customerDetail: { recordCode: "138311" },
			bookingFileStatus: { value: "QUOTATION" },
			startDate: "2014-12-27T00:00:00",
			endDate: "2015-01-03T00:00:00",
			selectedServiceList: [
				{ ...serviceDetail, toServiceType: "TOUR" as const },
			],
			passengerList: [passengerDetail],
		});
		expect(result.selectedServiceList[0].toServiceType).toBe("TOUR");
	});

	it("should reject invalid booking file status value", () => {
		expect(() =>
			parse(BookingFileSchema, {
				customerDetail: { recordCode: "138311" },
				bookingFileStatus: { value: "INVALID_STATUS" },
				startDate: "2014-12-27T00:00:00",
				endDate: "2015-01-03T00:00:00",
				selectedServiceList: [{ sCode: "S1" }],
				passengerList: [
					{ rph: "001", roomRph: "001", name: "A", categoryCode: "AD" },
				],
			}),
		).toThrow();
	});

	it("should reject missing required startDate", () => {
		expect(() =>
			parse(BookingFileSchema, {
				customerDetail: { recordCode: "138311" },
				bookingFileStatus: { value: "QUOTATION" },
				endDate: "2015-01-03T00:00:00",
				selectedServiceList: [{ sCode: "S1" }],
				passengerList: [
					{ rph: "001", roomRph: "001", name: "A", categoryCode: "AD" },
				],
			}),
		).toThrow();
	});
});

describe("BookingFileApiSchema", () => {
	it("should transform camelCase input to PascalCase with @ for attributes", () => {
		const result = parse(BookingFileApiSchema, {
			customerDetail: { recordCode: "138311" },
			bookingFileStatus: {
				value: "OPTIONED",
				expiredDate: "2014-09-26T23:59:00",
			},
			startDate: "2014-12-27T00:00:00",
			endDate: "2015-01-03T00:00:00",
			selectedServiceList: [
				{
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
			],
			passengerList: [
				{
					rph: "001",
					roomRph: "001",
					name: "A",
					categoryCode: "AD",
					sex: "M",
				},
			],
		});
		expect(result).toMatchObject({
			CustomerDetail: { "@RecordCode": "138311" },
			BookingFileStatus: {
				"@Value": "OPTIONED",
				"@ExpiredDate": "2014-09-26T23:59:00",
			},
			StartDate: "2014-12-27T00:00:00",
			SelectedServiceList: [{ SelectedServiceDetail: { "@sCode": "S1" } }],
			PassengerList: [
				{ PassengerDetail: { "@RPH": "001", "@RoomRph": "001" } },
			],
		});
	});

	it("should emit nested note content and the legacy payment attribute", () => {
		const result = parse(BookingFileApiSchema, {
			customerDetail: { recordCode: "138311" },
			bookingFileStatus: { value: "QUOTATION" },
			startDate: "2014-12-27T00:00:00",
			endDate: "2015-01-03T00:00:00",
			selectedServiceList: [
				{
					...serviceDetail,
					noteList: [{ nType: "INFO", text: "Bring passport" }],
				},
			],
			passengerList: [passengerDetail],
			paymentList: [{ paymentNote: "INCASSO" }],
		});
		const xml = jsonToXml({ BookFileRQ: result });

		expect(xml).toContain('sCode="VPARTENZUSTUT"');
		expect(xml).toContain('PaumentNote="INCASSO"');
		expect(xml).toContain(
			'<NoteDetail NType="INFO">Bring passport</NoteDetail>',
		);
	});
});

describe("BookingFileResponseSchema", () => {
	it("should parse OK response and transform to camelCase", () => {
		const result = parse(BookingFileResponseSchema, {
			RsStatus: { "@Status": "OK" },
			BookingFileDetail: {
				"@BookingFileCode": "14/036657",
				CustomerRecordCode: "138311",
				BookingFileStatus: { "@Value": "QUOTATION" },
				StartDate: "2014-12-27T00:00:00",
				EndDate: "2015-01-03T00:00:00",
			},
		});
		expect(result.rsStatus.status).toBe("OK");
		expect(result).toHaveProperty("bookingFileCode", "14/036657");
		expect(result).toHaveProperty("customerRecordCode", "138311");
	});

	it("should parse ERROR response", () => {
		const result = parse(BookingFileResponseSchema, {
			RsStatus: {
				"@Status": "ERROR",
				ErrorCode: 2001,
				ErrorDescription: "Booking creation failed",
			},
		});
		expect(result.rsStatus.status).toBe("ERROR");
		expect(result.rsStatus.errorCode).toBe(2001);
		expect(result).not.toHaveProperty("bookingFileCode");
	});

	it("should accept response without BookingFileDetail", () => {
		const result = parse(BookingFileResponseSchema, {
			RsStatus: { "@Status": "OK" },
		});
		expect(result.rsStatus.status).toBe("OK");
		expect(result).not.toHaveProperty("bookingFileCode");
	});
});

describe("createBooking request shape (BookFileRQ)", () => {
	it("should build request with BookFileRQ root and RqHeader + transformed body", () => {
		const apiBody = parse(BookingFileApiSchema, {
			customerDetail: { recordCode: "138311" },
			bookingFileStatus: { value: "QUOTATION" as const },
			startDate: "2014-12-27T00:00:00",
			endDate: "2015-01-03T00:00:00",
			selectedServiceList: [
				{
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
			],
			passengerList: [
				{
					rph: "001",
					roomRph: "001",
					name: "Adult",
					categoryCode: "AD" as const,
					sex: "M",
				},
			],
		});
		const requestBody = createRootElement(XML_ROOT_ELEMENTS.BOOKING_REQUEST, {
			RqHeader: {
				"@HostID": "025706",
				"@Xtoken": "TOKEN",
				"@Interface": "WEB",
				"@UserName": "WEB",
			},
			...apiBody,
		});

		expect(Object.keys(requestBody)).toContain("BookFileRQ");
		const root = requestBody.BookFileRQ as Record<string, unknown>;
		expect(root.CustomerDetail).toBeDefined();
		expect(root.StartDate).toBe("2014-12-27T00:00:00");
		expect(root.PassengerList).toBeDefined();
	});
});
