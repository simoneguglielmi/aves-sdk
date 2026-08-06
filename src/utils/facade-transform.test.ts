import { parse } from "valibot";
import { describe, expect, it } from "vitest";
import { BookingFileApiSchema } from "../schemas/booking-file.js";
import { AvesSearchSchema } from "../schemas/package-catalog.js";
import { withPublicAliases } from "./facade-transform.js";

describe("schema-owned facade aliases", () => {
	it("maps concise booking input into the XML vocabulary", () => {
		const wire = parse(BookingFileApiSchema, {
			customerCode: "138311",
			status: "CONFIRMED",
			startDate: "2026-08-06",
			endDate: "2026-08-07",
			services: [
				{
					serviceCode: "S1",
					serviceType: "TOP",
					startDate: "2026-08-06",
					endDate: "2026-08-07",
					quantity: "1",
					passengerCount: "1",
					session: "1",
				},
			],
			passengers: [
				{
					passengerRef: "001",
					name: "A",
					categoryCode: "AD",
					gender: "M",
				},
			],
		});

		expect(wire).toMatchObject({
			CustomerDetail: { "@RecordCode": "138311" },
			BookingFileStatus: { "@Value": "CONFIRMED" },
			SelectedServiceList: [{ SelectedServiceDetail: { "@sCode": "S1" } }],
		});
	});

	it("scopes passengerCount to schema context (pax vs paxQty)", () => {
		const booking = parse(BookingFileApiSchema, {
			customerCode: "1",
			status: "QUOTATION",
			startDate: "2026-08-06",
			endDate: "2026-08-07",
			services: [
				{
					serviceCode: "S1",
					serviceType: "TOP",
					startDate: "2026-08-06",
					endDate: "2026-08-07",
					quantity: "1",
					passengerCount: "2",
					session: "1",
				},
			],
			passengers: [
				{
					passengerRef: "001",
					name: "A",
					categoryCode: "AD",
					gender: "M",
				},
			],
		});
		expect(booking).toMatchObject({
			SelectedServiceList: [
				{ SelectedServiceDetail: expect.objectContaining({ Pax: "2" }) },
			],
		});

		const search = parse(AvesSearchSchema, {
			customerCode: "1",
			languageCode: "01",
			startDate: "2026-08-06",
			endDate: "2026-08-07",
			searchType: "PACKAGE",
			passengerCount: "3",
			passengers: [
				{
					passengerRef: "001",
					name: "A",
					categoryCode: "AD",
					gender: "M",
				},
			],
		});
		expect(search).toMatchObject({
			paxQty: "3",
			avesSearchType: "PACKAGE",
		});
		expect(search).not.toHaveProperty("passengerCount");
		expect(search).not.toHaveProperty("searchType");
	});

	it("prefers explicit AVES keys when both vocabularies are present", () => {
		const wire = parse(BookingFileApiSchema, {
			customerRecordCode: "AVES",
			customerCode: "FACADE",
			status: "CONFIRMED",
			startDate: "2026-08-06",
			endDate: "2026-08-07",
			selectedServiceList: [
				{
					sCode: "KEEP",
					serviceCode: "DROP",
					avesServiceType: "TOP",
					startDate: "2026-08-06",
					endDate: "2026-08-07",
					qty: "1",
					pax: "1",
					avesSession: "1",
				},
			],
			passengers: [
				{
					passengerRef: "001",
					name: "A",
					categoryCode: "AD",
					gender: "M",
				},
			],
		});
		expect(wire).toMatchObject({
			CustomerDetail: { "@RecordCode": "AVES" },
			SelectedServiceList: [
				{
					SelectedServiceDetail: expect.objectContaining({ "@sCode": "KEEP" }),
				},
			],
		});
	});
});

describe("withPublicAliases (Proxy facade)", () => {
	const sample = () =>
		withPublicAliases({
			rsStatus: { status: "OK" },
			bookingFileCode: "14/000001",
			bookingFileStatus: { value: "CONFIRMED" },
			bookedServiceList: [{ sCode: "S1", qty: "2", pax: "1" }],
		});

	it("adds concise aliases to nested response payloads", () => {
		const result = sample();
		expect(result).toMatchObject({
			response: { status: "OK" },
			bookingCode: "14/000001",
			status: { value: "CONFIRMED" },
			services: [{ serviceCode: "S1", quantity: "2", passengerCount: "1" }],
		});
		expect(result.bookingFileCode).toBe("14/000001");
	});

	it("preserves nested proxy identity", () => {
		const result = sample();
		expect(result.bookedServiceList).toBe(result.services);
		expect(result.services?.[0]).toBe(result.services?.[0]);
	});

	it("supports JSON.stringify / Object.keys / spread", () => {
		const result = sample();
		expect(Object.keys(result)).toEqual(
			expect.arrayContaining([
				"bookingFileCode",
				"bookingCode",
				"bookedServiceList",
				"services",
			]),
		);
		expect(JSON.parse(JSON.stringify(result))).toMatchObject({
			bookingFileCode: "14/000001",
			bookingCode: "14/000001",
			services: [{ sCode: "S1", serviceCode: "S1" }],
		});
		expect({ ...result }).toMatchObject({
			bookingCode: "14/000001",
			bookingFileCode: "14/000001",
		});
	});

	it("writes through public aliases onto AVES keys", () => {
		const result = withPublicAliases({
			bookingFileCode: "OLD",
		});
		result.bookingCode = "NEW";
		expect(result.bookingFileCode).toBe("NEW");
		expect(result.bookingCode).toBe("NEW");
	});

	it("blocks prototype pollution", () => {
		const target: Record<string, unknown> = { bookingFileCode: "1" };
		const result = withPublicAliases(target);
		expect(Reflect.set(result, "__proto__", { polluted: true })).toBe(false);
		expect(Reflect.setPrototypeOf(result, {})).toBe(false);
		expect(
			Object.prototype.hasOwnProperty.call(Object.prototype, "polluted"),
		).toBe(false);
		expect(Object.getPrototypeOf(result)).toBe(Object.getPrototypeOf(target));
	});

	it("handles circular graphs without infinite wrapping", () => {
		const node: { bookingFileCode: string; self?: unknown } = {
			bookingFileCode: "X",
		};
		node.self = node;
		const proxy = withPublicAliases(node);
		expect(proxy.self).toBe(proxy);
		expect(proxy.bookingCode).toBe("X");
	});

	it("is idempotent for the same target", () => {
		const target = { bookingFileCode: "1" };
		expect(withPublicAliases(target)).toBe(withPublicAliases(target));
	});

	it("does not wrap Date / special objects", () => {
		const created = new Date("2026-08-06T00:00:00.000Z");
		const result = withPublicAliases({ created });
		expect(result.created).toBe(created);
	});
});
