import { describe, expect, it } from "vitest";
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

const RUN = process.env.AVES_PERF === "1";

function largeBookingInput(services = 30, passengers = 60) {
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

function largeBookingWireRs(services = 30, passengers = 60) {
	return {
		RsStatus: { Status: "OK" },
		BookingFileCode: "14/036657",
		CustomerRecordCode: "138311",
		BookedServiceList: Array.from({ length: services }, (_, i) => ({
			RPH: String(i + 1).padStart(3, "0"),
			ServiceCode: `S${i}`,
			Qty: "1",
			Pax: "2",
		})),
		PassengerList: Array.from({ length: passengers }, (_, i) => ({
			RPH: String(i + 1).padStart(3, "0"),
			Name: `PAX ${i}`,
		})),
	};
}

function deepAliasCopy(value: unknown): unknown {
	const walk = (node: unknown): unknown => {
		if (Array.isArray(node)) return node.map(walk);
		if (node === null || typeof node !== "object") return node;
		const output: Record<string, unknown> = {};
		for (const [key, child] of Object.entries(node)) {
			const next = walk(child);
			output[key] = next;
			const publicKey =
				publicKeyAliases[key as keyof typeof publicKeyAliases];
			if (publicKey && output[publicKey] === undefined)
				output[publicKey] = next;
		}
		return output;
	};
	return walk(value);
}

function timeMs(fn: () => void, iterations: number): number {
	const start = performance.now();
	for (let i = 0; i < iterations; i++) fn();
	return performance.now() - start;
}

describe.skipIf(!RUN)("hot-path performance (AVES_PERF=1)", () => {
	const input = largeBookingInput();
	const wireRs = largeBookingWireRs();
	const camelRs = pascalToCamelKeys(structuredClone(wireRs));
	const iterations = 80;

	it("fused toWireBody is not slower than legacy 3-walk (≤1.35×)", () => {
		toWireBody(input, bookingFileWire);
		camelToPascalKeys(
			normalizeEmptyPaxAssociated(wrapListDetails(input, bookingFileWire)),
			bookingFileWire,
		);

		const fused = timeMs(() => toWireBody(input, bookingFileWire), iterations);
		const legacy = timeMs(() => {
			camelToPascalKeys(
				normalizeEmptyPaxAssociated(
					wrapListDetails(input, bookingFileWire),
				),
				bookingFileWire,
			);
		}, iterations);

		expect(fused).toBeLessThanOrEqual(legacy * 1.35);
	});

	it("in-place camelize is not slower than immutable copy (≤1.25×, same clone cost)", () => {
		pascalToCamelKeys(structuredClone(wireRs));
		pascalToCamelKeysInPlace(structuredClone(wireRs));

		const copy = timeMs(
			() => pascalToCamelKeys(structuredClone(wireRs)),
			iterations,
		);
		const inPlace = timeMs(
			() => pascalToCamelKeysInPlace(structuredClone(wireRs)),
			iterations,
		);

		expect(inPlace).toBeLessThanOrEqual(copy * 1.25);
	});

	it("Proxy amortizes over many reads vs repeated deep copies (≤0.25×)", () => {
		const reads = 200;
		const proxied = withPublicAliases(camelRs) as Record<string, unknown>;
		deepAliasCopy(camelRs);

		const proxy = timeMs(() => {
			for (let r = 0; r < reads; r++) {
				void proxied.bookingCode;
				void (proxied.services as Record<string, unknown>[] | undefined)?.[0]
					?.serviceCode;
			}
		}, iterations);

		const deep = timeMs(() => {
			for (let r = 0; r < reads; r++) {
				const data = deepAliasCopy(camelRs) as Record<string, unknown>;
				void data.bookingCode;
				void (data.services as Record<string, unknown>[] | undefined)?.[0]
					?.serviceCode;
			}
		}, iterations);

		expect(proxy).toBeLessThanOrEqual(deep * 0.25);
	});
});
