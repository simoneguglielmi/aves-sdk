import { describe, expect, it } from "vitest";
import { parse } from "../effect/schema-parse.js";
import {
	SearchMasterRecordApiSchema,
	SearchMasterRecordResponseSchema,
	SearchMasterRecordSchema,
} from "./search.js";

describe("SearchMasterRecordSchema", () => {
	it("should validate valid search request with CODE type", () => {
		const input = {
			searchType: "CODE",
			recordCode: "508558",
			languageCode: "02",
		};

		const result = parse(SearchMasterRecordSchema, input);
		expect(result).toBeDefined();
		expect(result.searchType).toBe("CODE");
		if (result.searchType === "CODE") {
			expect(result.recordCode).toBe("508558");
		}
	});

	it("should validate valid search request with EMAIL type", () => {
		const input = {
			searchType: "EMAIL",
			email: "user@example.com",
		};

		const result = parse(SearchMasterRecordSchema, input);
		expect(result).toBeDefined();
		expect(result.searchType).toBe("EMAIL");
	});

	it("should validate search request with NAME type", () => {
		const input = {
			searchType: "NAME",
			name: "John Doe",
			city: "New York",
		};

		const result = parse(SearchMasterRecordSchema, input);
		expect(result).toBeDefined();
	});

	it("should validate search request with LASTMODDATE type", () => {
		const input = {
			searchType: "LASTMODDATE",
			lastModificationDate: {
				minDate: "2024-01-01",
				maxDate: "2024-12-31",
			},
		};

		const result = parse(SearchMasterRecordSchema, input);
		expect(result).toBeDefined();
	});

	it("should reject invalid SearchType", () => {
		const input = {
			searchType: "INVALID",
			recordCode: "508558",
		};

		expect(() => parse(SearchMasterRecordSchema, input)).toThrow();
	});

	it("should reject RecordCode with invalid length", () => {
		const input = {
			searchType: "CODE",
			recordCode: "1234", // Too short (must be 5-6)
		};

		expect(() => parse(SearchMasterRecordSchema, input)).toThrow();
	});

	it("should reject LanguageCode with invalid length", () => {
		const input = {
			searchType: "CODE",
			recordCode: "508558",
			languageCode: "1", // Too short (must be 2)
		};

		expect(() => parse(SearchMasterRecordSchema, input)).toThrow();
	});

	it("should reject CODE search without required recordCode", () => {
		const input = {
			searchType: "CODE",
		};

		expect(() => parse(SearchMasterRecordSchema, input)).toThrow();
	});

	it("should reject NAME search without required name", () => {
		const input = {
			searchType: "NAME",
		};

		expect(() => parse(SearchMasterRecordSchema, input)).toThrow();
	});

	it("should reject VATCODE search without required vatCode", () => {
		const input = {
			searchType: "VATCODE",
		};

		expect(() => parse(SearchMasterRecordSchema, input)).toThrow();
	});

	it("should reject ZONE search without required zipCode", () => {
		const input = {
			searchType: "ZONE",
			countyCode: "RN",
		};

		expect(() => parse(SearchMasterRecordSchema, input)).toThrow();
	});

	it("should reject ZONE search without required countyCode", () => {
		const input = {
			searchType: "ZONE",
			zipCode: "47841",
		};

		expect(() => parse(SearchMasterRecordSchema, input)).toThrow();
	});

	it("should reject CATEGORY search without required categoryCode", () => {
		const input = {
			searchType: "CATEGORY",
		};

		expect(() => parse(SearchMasterRecordSchema, input)).toThrow();
	});

	it("should reject EMAIL search without required email", () => {
		const input = {
			searchType: "EMAIL",
		};

		expect(() => parse(SearchMasterRecordSchema, input)).toThrow();
	});

	it("should reject LASTMODDATE search without required lastModificationDate", () => {
		const input = {
			searchType: "LASTMODDATE",
		};

		expect(() => parse(SearchMasterRecordSchema, input)).toThrow();
	});

	it("should reject SEARCH_FIELD search without required searchFieldValue", () => {
		const input = {
			searchType: "SEARCH_FIELD",
		};

		expect(() => parse(SearchMasterRecordSchema, input)).toThrow();
	});

	it("should reject EXTERNAL_REF_CODE search without required searchFieldValue", () => {
		const input = {
			searchType: "EXTERNAL_REF_CODE",
		};

		expect(() => parse(SearchMasterRecordSchema, input)).toThrow();
	});

	it("should validate ZONE search with all required fields", () => {
		const input = {
			searchType: "ZONE",
			zipCode: "47841",
			countyCode: "RN",
			city: "Cattolica",
		};

		const result = parse(SearchMasterRecordSchema, input);
		expect(result).toBeDefined();
		expect(result.searchType).toBe("ZONE");
		if (result.searchType === "ZONE") {
			expect(result.zipCode).toBe("47841");
			expect(result.countyCode).toBe("RN");
			expect(result.city).toBe("Cattolica");
		}
	});

	it("should validate VATCODE search with optional phoneNumber", () => {
		const input = {
			searchType: "VATCODE",
			vatCode: "RSSMRO79P08G479P",
			phoneNumber: "0541123456",
		};

		const result = parse(SearchMasterRecordSchema, input);
		expect(result).toBeDefined();
		expect(result.searchType).toBe("VATCODE");
		if (result.searchType === "VATCODE") {
			expect(result.vatCode).toBe("RSSMRO79P08G479P");
			expect(result.phoneNumber).toBe("0541123456");
		}
	});
});

describe("SearchMasterRecordApiSchema", () => {
	it("should transform camelCase input to PascalCase", () => {
		const input = {
			searchType: "CODE",
			recordCode: "508558",
			languageCode: "02",
		};

		const validated = parse(SearchMasterRecordSchema, input);
		const result = parse(SearchMasterRecordApiSchema, validated);
		expect(result).toHaveProperty("SearchType", "CODE");
		expect(result).toHaveProperty("RecordCode", "508558");
		expect(result).toHaveProperty("LanguageCode", "02");
	});
});

describe("SearchMasterRecordResponseSchema", () => {
	it("should transform PascalCase API response to camelCase", () => {
		const apiResponse = {
			RsStatus: {
				"@Status": "OK",
			},
			MasterRecordList: {
				MasterRecordDetail: [],
			},
		};

		const result = parse(SearchMasterRecordResponseSchema, apiResponse);
		expect(result).toHaveProperty("rsStatus");
		expect(result.rsStatus).toHaveProperty("status", "OK");
		expect(result).toHaveProperty("masterRecordList");
		expect(result.masterRecordList).toEqual([]);
	});

	it("should always expose masterRecordList as a flat array", () => {
		const apiResponse = {
			RsStatus: { "@Status": "OK" },
			MasterRecordList: {
				MasterRecordDetail: [
					{ "@RecordCode": "508558", Name: "Ennequadro s.r.l." },
				],
			},
		};

		const result = parse(SearchMasterRecordResponseSchema, apiResponse);
		expect(result.masterRecordList).toHaveLength(1);
		expect(result.masterRecordList?.[0]?.recordCode).toBe("508558");
		expect(result.masterRecordList?.[0]?.name).toBe("Ennequadro s.r.l.");
		expect(result).not.toHaveProperty("recordCode");
	});

	it("should keep multiple records in masterRecordList", () => {
		const apiResponse = {
			RsStatus: { "@Status": "OK" },
			MasterRecordList: {
				MasterRecordDetail: [
					{ "@RecordCode": "508558", Name: "A" },
					{ "@RecordCode": "508559", Name: "B" },
				],
			},
		};

		const result = parse(SearchMasterRecordResponseSchema, apiResponse);
		expect(result.masterRecordList).toHaveLength(2);
		expect(result).not.toHaveProperty("recordCode");
	});
});
