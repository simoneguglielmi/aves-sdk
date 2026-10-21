import { test } from "vitest";
import {
	normalizeEmptyPaxAssociated,
	toWireBody,
	wrapListDetails,
} from "./booking-transform.js";
import {
	camelToPascalKeys,
	pascalToCamelKeys,
	pascalToCamelKeysInPlace,
} from "./case-transform.js";
import { publicKeyAliases, withPublicAliases } from "./facade-transform.js";
import { bookingFileWire } from "./wire-shapes.js";

/** Large-ish createBooking-shaped SDK input. */
function largeBookingInput(services = 40, passengers = 80) {
	return {
		customerDetail: { recordCode: "138311" },
		bookingFileStatus: { value: "QUOTATION" as const },
		startDate: "2014-12-27T00:00:00",
		endDate: "2015-01-03T00:00:00",
		selectedServiceList: Array.from({ length: services }, (_, i) => ({
			sCode: `S${i}`,
			avesServiceType: "TOP" as const,
			toServiceType: "TRANSPORT" as const,
			startDate: "2014-12-27T00:00:00",
			endDate: "2015-01-03T00:00:00",
			qty: "1",
			pax: "2",
			paxAssociated: ["001", "002"],
			avesSession: "1",
		})),
		passengerList: Array.from({ length: passengers }, (_, i) => ({
			rph: String(i + 1).padStart(3, "0"),
			roomRph: "001",
			name: `PAX ${i}`,
			categoryCode: "AD" as const,
			sex: "M" as const,
		})),
	};
}

/** Pascal wire-shaped booking RS after Valibot (pre-camelize). */
function largeBookingWireRs(services = 40, passengers = 80) {
	return {
		RsStatus: { Status: "OK" },
		BookingFileCode: "14/036657",
		CustomerRecordCode: "138311",
		BookingFileStatus: { Value: "CONFIRMED" },
		StartDate: "2014-12-27T00:00:00",
		EndDate: "2015-01-03T00:00:00",
		BookedServiceList: Array.from({ length: services }, (_, i) => ({
			RPH: String(i + 1).padStart(3, "0"),
			ServiceCode: `S${i}`,
			AvesServiceType: "TOP",
			Qty: "1",
			Pax: "2",
		})),
		PassengerList: Array.from({ length: passengers }, (_, i) => ({
			RPH: String(i + 1).padStart(3, "0"),
			Name: `PAX ${i}`,
			CategoryCode: "AD",
			Sex: "M",
		})),
	};
}

/** Pre-Proxy deep alias copy (baseline before hardened Proxy). */
function deepAliasCopy(value: unknown): unknown {
	const walk = (node: unknown): unknown => {
		if (Array.isArray(node)) return node.map(walk);
		if (node === null || typeof node !== "object") return node;
		const output: Record<string, unknown> = {};
		for (const [key, child] of Object.entries(node)) {
			const next = walk(child);
			output[key] = next;
			const publicKey = publicKeyAliases[key as keyof typeof publicKeyAliases];
			if (publicKey && output[publicKey] === undefined)
				output[publicKey] = next;
		}
		return output;
	};
	return walk(value);
}

function touchFacade(data: Record<string, unknown>) {
	void data.bookingFileCode;
	void data.bookingCode;
	void data.customerRecordCode;
	void data.customerCode;
	const services = (data.bookedServiceList ?? data.services) as
		| Record<string, unknown>[]
		| undefined;
	const first = services?.[0];
	if (first) {
		void first.serviceCode;
		void first.sCode;
		void first.quantity;
		void first.qty;
	}
}

const bookingInput = largeBookingInput();
const bookingWireRs = largeBookingWireRs();
const bookingCamelRs = pascalToCamelKeys(
	structuredClone(bookingWireRs),
) as Record<string, unknown>;

/** Same budget for every comparison: short runs, enough to rank the variants. */
const BENCH_OPTIONS = { time: 300, warmupTime: 50 };

test("toWireBody", async ({ bench }) => {
	await bench.compare(
		bench("fused toWireBody (current)", () => {
			toWireBody(bookingInput, bookingFileWire);
		}),
		bench("legacy 3-walk (wrap → pax → pascal)", () => {
			camelToPascalKeys(
				normalizeEmptyPaxAssociated(
					wrapListDetails(bookingInput, bookingFileWire),
				),
				bookingFileWire,
			);
		}),
		BENCH_OPTIONS,
	);
});

test("pascalToCamelKeys", async ({ bench }) => {
	await bench.compare(
		bench("immutable copy (from fresh clone)", () => {
			pascalToCamelKeys(structuredClone(bookingWireRs));
		}),
		bench("in-place mutate (on fresh clone)", () => {
			pascalToCamelKeysInPlace(structuredClone(bookingWireRs));
		}),
		BENCH_OPTIONS,
	);
});

test("withPublicAliases", async ({ bench }) => {
	await bench.compare(
		bench("Proxy wrap (fresh target) + selective get", () => {
			touchFacade(
				withPublicAliases(structuredClone(bookingCamelRs)) as Record<
					string,
					unknown
				>,
			);
		}),
		bench("deep alias copy + selective get", () => {
			touchFacade(
				deepAliasCopy(structuredClone(bookingCamelRs)) as Record<
					string,
					unknown
				>,
			);
		}),
		bench("Proxy cached + JSON.stringify", () => {
			JSON.stringify(withPublicAliases(bookingCamelRs));
		}),
		bench("deep alias copy + JSON.stringify", () => {
			JSON.stringify(deepAliasCopy(bookingCamelRs));
		}),
		BENCH_OPTIONS,
	);
});
