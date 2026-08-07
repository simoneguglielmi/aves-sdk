import { parse, safeParse } from "../effect/schema-parse.js";
import { describe, expect, it } from "vitest";
import {
	MasterRecordDetailApiValidationSchema,
	MasterRecordDetailSchema,
} from "./master-record.js";

describe("MasterRecordDetailApiValidationSchema — enum membership (finding #1)", () => {
	it("rejects recordType: CUTSOMER (typo, not a real RecordType value)", () => {
		const result = safeParse(MasterRecordDetailApiValidationSchema, {
			RecordType: "CUTSOMER",
		});
		expect(result.success).toBe(false);
	});

	it("rejects recordStatus: lol (not a real RecordStatus value)", () => {
		const result = safeParse(MasterRecordDetailApiValidationSchema, {
			RecordStatus: "lol",
		});
		expect(result.success).toBe(false);
	});

	it("rejects @InsertCriteria: ZZZ (not a real InsertCriteria value)", () => {
		const result = safeParse(MasterRecordDetailApiValidationSchema, {
			"@InsertCriteria": "ZZZ",
		});
		expect(result.success).toBe(false);
	});

	it("rejects Gender: Q (not a real Gender value)", () => {
		const result = safeParse(MasterRecordDetailApiValidationSchema, {
			Gender: "Q",
		});
		expect(result.success).toBe(false);
	});
});

describe("MasterRecordDetailApiValidationSchema — RecordType VOUCHER / SUPPLIER_VOUCHER (D4 regression)", () => {
	it("REGRESSION: accepts RecordType: VOUCHER — AVES really sends this (MasterRecord.txt:214-219); pre-fix SDK only had CUSTOMER/SUPPLIER/GENERAL and this failed", () => {
		const result = safeParse(MasterRecordDetailApiValidationSchema, {
			RecordType: "VOUCHER",
		});
		expect(result.success).toBe(true);
	});

	it("REGRESSION: accepts RecordType: SUPPLIER_VOUCHER — AVES really sends this (MasterRecord.txt:214-219); pre-fix SDK only had CUSTOMER/SUPPLIER/GENERAL and this failed", () => {
		const result = safeParse(MasterRecordDetailApiValidationSchema, {
			RecordType: "SUPPLIER_VOUCHER",
		});
		expect(result.success).toBe(true);
	});
});

describe("MasterRecordDetailSchema — recordType / recordStatus defaults (finding #2)", () => {
	it("defaults recordType to CUSTOMER and recordStatus to ENABLED when omitted", () => {
		const result = parse(MasterRecordDetailSchema, { languageCode: "01" });
		expect(result.recordType).toBe("CUSTOMER");
		expect(result.recordStatus).toBe("ENABLED");
	});

	it("does not override an explicitly provided recordType / recordStatus", () => {
		const result = parse(MasterRecordDetailSchema, {
			languageCode: "01",
			recordType: "SUPPLIER",
			recordStatus: "BLACKLISTED",
		});
		expect(result.recordType).toBe("SUPPLIER");
		expect(result.recordStatus).toBe("BLACKLISTED");
	});
});
