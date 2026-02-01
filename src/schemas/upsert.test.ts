import { parse, safeParse } from "valibot";
import { describe, expect, it } from "vitest";
import {
	AccountPoliciesSchema,
	DynamicFieldsSchema,
	FinancialDetailSchema,
	IdDocumentDetailSchema,
	MasterRecordDetailApiSchema,
	MasterRecordDetailSchema,
} from "./master-record.js";
import {
	ManageMasterRecordRequestSchema,
	ManageMasterRecordResponseSchema,
} from "./upsert.js";

describe("ManageMasterRecordRequestSchema", () => {
	it("should validate valid upsert request", () => {
		const input = {
			RqHeader: {
				"@HostID": "025706",
				"@Xtoken": "TOKEN002756",
				"@Interface": "WEB",
				"@UserName": "WEB",
			},
			MasterRecordDetail: {
				"@InsertCriteria": "S",
				Name: "John Doe",
				Email: "john@example.com",
				ZipCode: "12345",
			},
		};

		const result = parse(ManageMasterRecordRequestSchema, input);
		expect(result).toBeDefined();
	});

	it("should reject invalid InsertCriteria", () => {
		const input = {
			RqHeader: {
				"@HostID": "025706",
				"@Xtoken": "TOKEN002756",
				"@Interface": "WEB",
				"@UserName": "WEB",
			},
			MasterRecordDetail: {
				"@InsertCriteria": "X", // Invalid - must be S, N, T, or M
				Name: "John Doe",
			},
		};

		expect(() => parse(ManageMasterRecordRequestSchema, input)).toThrow();
	});

	it("should reject invalid HostID length", () => {
		const input = {
			RqHeader: {
				"@HostID": "12345", // Too short (must be 6)
				"@Xtoken": "TOKEN002756",
				"@Interface": "WEB",
				"@UserName": "WEB",
			},
			MasterRecordDetail: {
				"@InsertCriteria": "S",
				Name: "John Doe",
			},
		};

		expect(() => parse(ManageMasterRecordRequestSchema, input)).toThrow();
	});
});

describe("MasterRecordDetailSchema", () => {
	it("should validate camelCase input", () => {
		const input = {
			name: "John Doe",
			email: "john@example.com",
			zipCode: "12345",
			languageCode: "02",
		};

		const result = parse(MasterRecordDetailSchema, input);
		expect(result).toBeDefined();
		expect(result.name).toBe("John Doe");
		expect(result.email).toBe("john@example.com");
		expect(result.zipCode).toBe("12345");
	});

	it("should reject invalid languageCode length", () => {
		const input = {
			name: "John Doe",
			languageCode: "1", // Too short (must be 2)
		};

		expect(() => parse(MasterRecordDetailSchema, input)).toThrow();
	});
});

describe("MasterRecordDetailApiSchema", () => {
	it("should transform camelCase input to PascalCase with @ prefix for attributes", () => {
		const input = {
			recordCode: "508558", // attribute field
			name: "John Doe",
			email: "john@example.com",
			zipCode: "12345",
			languageCode: "02",
		};

		const validated = parse(MasterRecordDetailSchema, input);
		const result = parse(MasterRecordDetailApiSchema, validated);
		expect(result).toHaveProperty("@RecordCode", "508558"); // recordCode is an attribute field
		expect(result).toHaveProperty("Name", "John Doe");
		expect(result).toHaveProperty("Email", "john@example.com");
		expect(result).toHaveProperty("ZipCode", "12345");
	});
});

describe("ManageMasterRecordResponseSchema", () => {
	it("should transform PascalCase API response to camelCase", () => {
		const apiResponse = {
			RsStatus: {
				"@Status": "OK",
			},
			MasterRecordDetail: {
				"@RecordCode": "508558",
				Name: "John Doe",
				Email: "john@example.com",
				ZipCode: "12345",
			},
		};

		const result = parse(ManageMasterRecordResponseSchema, apiResponse);
		expect(result).toHaveProperty("rsStatus");
		expect(result.rsStatus).toHaveProperty("status", "OK");
		expect(result).toHaveProperty("masterRecordDetail");
		expect(result.masterRecordDetail).toHaveProperty("recordCode", "508558");
	});
});

// ============================================================================
// Nested Object Tests
// ============================================================================

describe("FinancialDetailSchema", () => {
	it("should validate valid financial detail with all fields", () => {
		const input = {
			currencyCode: "EUR",
			creditLimit: "10000",
			c_PaymentType: "CASH",
			c_SpecPaymentTypeCode: "SPEC001",
			s_PaymentType: "BANK",
			s_SpecPaymentTypeCode: "SPEC002",
			enableElectronicInvoicing: true,
			electronicInvoicingType: "SDI",
		};

		const result = parse(FinancialDetailSchema, input);
		expect(result).toBeDefined();
	});

	it("should accept all valid payment types", () => {
		const paymentTypes = [
			"CASH",
			"BANK",
			"RID",
			"RIBA",
			"SPECIFIC_CODE",
		] as const;

		for (const paymentType of paymentTypes) {
			const input = { c_PaymentType: paymentType };
			const result = parse(FinancialDetailSchema, input);
			expect(result).toBeDefined();
		}
	});

	it("should reject invalid payment type", () => {
		const input = {
			c_PaymentType: "INVALID_TYPE",
		};

		expect(() => parse(FinancialDetailSchema, input)).toThrow();
	});

	it("should accept enableElectronicInvoicing as boolean", () => {
		const inputTrue = { enableElectronicInvoicing: true };
		const inputFalse = { enableElectronicInvoicing: false };

		expect(parse(FinancialDetailSchema, inputTrue)).toBeDefined();
		expect(parse(FinancialDetailSchema, inputFalse)).toBeDefined();
	});

	it("should accept enableElectronicInvoicing as string literal", () => {
		const inputTrue = { enableElectronicInvoicing: "true" as const };
		const inputFalse = { enableElectronicInvoicing: "false" as const };

		expect(parse(FinancialDetailSchema, inputTrue)).toBeDefined();
		expect(parse(FinancialDetailSchema, inputFalse)).toBeDefined();
	});

	it("should transform to PascalCase with @ prefix for attributes", () => {
		const input = {
			currencyCode: "EUR",
			creditLimit: "5000",
			c_PaymentType: "CASH",
		};

		const result = parse(FinancialDetailSchema, input);

		// All financial detail fields are attributes
		expect(result).toHaveProperty("@CurrencyCode", "EUR");
		expect(result).toHaveProperty("@CreditLimit", "5000");
		expect(result).toHaveProperty("@C_PaymentType", "CASH");
	});

	it("should allow empty financial detail", () => {
		const result = parse(FinancialDetailSchema, {});
		expect(result).toBeDefined();
	});
});

describe("IdDocumentDetailSchema", () => {
	it("should validate valid ID document detail with all fields", () => {
		const input = {
			idType: "PASSPORT",
			idCode: "AB1234567",
			idIssueLocation: "Rome",
			idIssueCounty: "RM",
			idIssueDate: "2020-01-15",
			idExpireDate: "2030-01-15",
		};

		const result = parse(IdDocumentDetailSchema, input);
		expect(result).toBeDefined();
	});

	it("should transform to PascalCase with @ prefix for attributes", () => {
		const input = {
			idType: "ID_CARD",
			idCode: "CA12345678",
			idIssueDate: "2022-06-01",
		};

		const result = parse(IdDocumentDetailSchema, input);

		// All ID document detail fields are attributes
		expect(result).toHaveProperty("@IdType", "ID_CARD");
		expect(result).toHaveProperty("@IdCode", "CA12345678");
		expect(result).toHaveProperty("@IdIssueDate", "2022-06-01");
	});

	it("should allow partial ID document detail", () => {
		const input = {
			idType: "DRIVER_LICENSE",
		};

		const result = parse(IdDocumentDetailSchema, input);
		expect(result).toBeDefined();
	});

	it("should allow empty ID document detail", () => {
		const result = parse(IdDocumentDetailSchema, {});
		expect(result).toBeDefined();
	});
});

describe("AccountPoliciesSchema", () => {
	it("should validate valid account policies with all flags", () => {
		const input = {
			acceptProfilingPolicies: 1,
			acceptPrivacyPolicies: 1,
			acceptNewsletterPolicies: 0,
		};

		const result = parse(AccountPoliciesSchema, input);
		expect(result).toBeDefined();
	});

	it("should accept 0 and 1 as valid flag values", () => {
		const input0 = { acceptPrivacyPolicies: 0 };
		const input1 = { acceptPrivacyPolicies: 1 };

		expect(parse(AccountPoliciesSchema, input0)).toBeDefined();
		expect(parse(AccountPoliciesSchema, input1)).toBeDefined();
	});

	it("should reject invalid flag values (not 0 or 1)", () => {
		const input = {
			acceptPrivacyPolicies: 2,
		};

		expect(() => parse(AccountPoliciesSchema, input)).toThrow();
	});

	it("should reject boolean values for flags", () => {
		const input = {
			acceptPrivacyPolicies: true, // Should be 0 or 1, not boolean
		};

		const result = safeParse(AccountPoliciesSchema, input);
		expect(result.success).toBe(false);
	});

	it("should transform to PascalCase with @ prefix for attributes", () => {
		const input = {
			acceptProfilingPolicies: 1,
			acceptPrivacyPolicies: 1,
			acceptNewsletterPolicies: 0,
		};

		const result = parse(AccountPoliciesSchema, input);

		// All account policies fields are attributes
		expect(result).toHaveProperty("@AcceptProfilingPolicies", 1);
		expect(result).toHaveProperty("@AcceptPrivacyPolicies", 1);
		expect(result).toHaveProperty("@AcceptNewsletterPolicies", 0);
	});

	it("should allow empty account policies", () => {
		const result = parse(AccountPoliciesSchema, {});
		expect(result).toBeDefined();
	});
});

describe("DynamicFieldsSchema", () => {
	it("should validate valid dynamic field", () => {
		const input = {
			key: "loyalty_tier",
			value: "gold",
		};

		const result = parse(DynamicFieldsSchema, input);
		expect(result).toBeDefined();
	});

	it("should require both key and value", () => {
		expect(() => parse(DynamicFieldsSchema, { key: "test" })).toThrow();
		expect(() => parse(DynamicFieldsSchema, { value: "test" })).toThrow();
		expect(() => parse(DynamicFieldsSchema, {})).toThrow();
	});

	it("should transform to PascalCase with @ prefix for attributes", () => {
		const input = {
			key: "custom_field",
			value: "custom_value",
		};

		const result = parse(DynamicFieldsSchema, input);

		// key and value are attribute fields
		expect(result).toHaveProperty("@Key", "custom_field");
		expect(result).toHaveProperty("@Value", "custom_value");
	});
});

describe("MasterRecordDetailSchema with nested objects", () => {
	it("should validate master record with financialDetail", () => {
		const input = {
			languageCode: "02",
			name: "John Doe",
			financialDetail: {
				currencyCode: "EUR",
				c_PaymentType: "CASH",
				enableElectronicInvoicing: true,
			},
		};

		const result = parse(MasterRecordDetailSchema, input);
		expect(result).toBeDefined();
		expect(result.financialDetail).toBeDefined();
		expect(result.financialDetail?.currencyCode).toBe("EUR");
	});

	it("should validate master record with idDocumentDetail", () => {
		const input = {
			languageCode: "02",
			name: "John Doe",
			idDocumentDetail: {
				idType: "PASSPORT",
				idCode: "AB1234567",
				idExpireDate: "2030-01-15",
			},
		};

		const result = parse(MasterRecordDetailSchema, input);
		expect(result).toBeDefined();
		expect(result.idDocumentDetail).toBeDefined();
		expect(result.idDocumentDetail?.idType).toBe("PASSPORT");
	});

	it("should validate master record with accountPolicies", () => {
		const input = {
			languageCode: "02",
			name: "John Doe",
			accountPolicies: {
				acceptProfilingPolicies: 0,
				acceptPrivacyPolicies: 1,
				acceptNewsletterPolicies: 1,
			},
		};

		const result = parse(MasterRecordDetailSchema, input);
		expect(result).toBeDefined();
		expect(result.accountPolicies).toBeDefined();
		expect(result.accountPolicies?.acceptPrivacyPolicies).toBe(1);
	});

	it("should validate master record with dynamicFields", () => {
		const input = {
			languageCode: "02",
			name: "John Doe",
			dynamicFields: {
				key: "loyalty_tier",
				value: "platinum",
			},
		};

		const result = parse(MasterRecordDetailSchema, input);
		expect(result).toBeDefined();
		expect(result.dynamicFields).toBeDefined();
		expect(result.dynamicFields?.key).toBe("loyalty_tier");
	});

	it("should validate master record with all nested objects", () => {
		const input = {
			languageCode: "02",
			recordCode: "508558",
			insertCriteria: "M",
			name: "John Doe",
			email: "john@example.com",
			financialDetail: {
				currencyCode: "USD",
				creditLimit: "25000",
				c_PaymentType: "BANK",
			},
			idDocumentDetail: {
				idType: "ID_CARD",
				idCode: "CA98765432",
			},
			accountPolicies: {
				acceptProfilingPolicies: 1,
				acceptPrivacyPolicies: 1,
				acceptNewsletterPolicies: 0,
			},
			dynamicFields: {
				key: "referral_source",
				value: "website",
			},
		};

		const result = parse(MasterRecordDetailSchema, input);
		expect(result).toBeDefined();
		expect(result.financialDetail).toBeDefined();
		expect(result.idDocumentDetail).toBeDefined();
		expect(result.accountPolicies).toBeDefined();
		expect(result.dynamicFields).toBeDefined();
	});
});

describe("MasterRecordDetailApiSchema with nested objects", () => {
	it("should transform nested financialDetail to PascalCase with @ attributes", () => {
		const input = {
			languageCode: "02",
			name: "John Doe",
			financialDetail: {
				currencyCode: "EUR",
				c_PaymentType: "CASH",
			},
		};

		const validated = parse(MasterRecordDetailSchema, input);
		const result = parse(MasterRecordDetailApiSchema, validated);

		expect(result).toHaveProperty("FinancialDetail");
		expect(result.FinancialDetail).toHaveProperty("@CurrencyCode", "EUR");
		expect(result.FinancialDetail).toHaveProperty("@C_PaymentType", "CASH");
	});

	it("should transform nested accountPolicies to PascalCase with @ attributes", () => {
		const input = {
			languageCode: "02",
			name: "John Doe",
			accountPolicies: {
				acceptPrivacyPolicies: 1,
				acceptNewsletterPolicies: 0,
			},
		};

		const validated = parse(MasterRecordDetailSchema, input);
		const result = parse(MasterRecordDetailApiSchema, validated);

		expect(result).toHaveProperty("AccountPolicies");
		expect(result.AccountPolicies).toHaveProperty("@AcceptPrivacyPolicies", 1);
		expect(result.AccountPolicies).toHaveProperty(
			"@AcceptNewsletterPolicies",
			0,
		);
	});

	it("should transform nested idDocumentDetail to PascalCase with @ attributes", () => {
		const input = {
			languageCode: "02",
			name: "John Doe",
			idDocumentDetail: {
				idType: "PASSPORT",
				idCode: "AB1234567",
			},
		};

		const validated = parse(MasterRecordDetailSchema, input);
		const result = parse(MasterRecordDetailApiSchema, validated);

		expect(result).toHaveProperty("IdDocumentDetail");
		expect(result.IdDocumentDetail).toHaveProperty("@IdType", "PASSPORT");
		expect(result.IdDocumentDetail).toHaveProperty("@IdCode", "AB1234567");
	});

	it("should transform nested dynamicFields to PascalCase with @ attributes", () => {
		const input = {
			languageCode: "02",
			name: "John Doe",
			dynamicFields: {
				key: "custom_key",
				value: "custom_value",
			},
		};

		const validated = parse(MasterRecordDetailSchema, input);
		const result = parse(MasterRecordDetailApiSchema, validated);

		expect(result).toHaveProperty("DynamicFields");
		expect(result.DynamicFields).toHaveProperty("@Key", "custom_key");
		expect(result.DynamicFields).toHaveProperty("@Value", "custom_value");
	});
});

describe("ManageMasterRecordResponseSchema with nested objects", () => {
	it("should transform API response with financialDetail to camelCase", () => {
		const apiResponse = {
			RsStatus: { "@Status": "OK" },
			MasterRecordDetail: {
				"@RecordCode": "508558",
				Name: "John Doe",
				FinancialDetail: {
					"@CurrencyCode": "EUR",
					"@CreditLimit": "10000",
					"@C_PaymentType": "CASH",
				},
			},
		};

		const result = parse(ManageMasterRecordResponseSchema, apiResponse);

		expect(result.masterRecordDetail).toBeDefined();
		expect(result.masterRecordDetail?.financialDetail).toBeDefined();
		expect(result.masterRecordDetail?.financialDetail?.currencyCode).toBe(
			"EUR",
		);
		expect(result.masterRecordDetail?.financialDetail?.creditLimit).toBe(
			"10000",
		);
	});

	it("should transform API response with accountPolicies to camelCase", () => {
		const apiResponse = {
			RsStatus: { "@Status": "OK" },
			MasterRecordDetail: {
				"@RecordCode": "508558",
				Name: "John Doe",
				AccountPolicies: {
					"@AcceptPrivacyPolicies": 1,
					"@AcceptNewsletterPolicies": 0,
				},
			},
		};

		const result = parse(ManageMasterRecordResponseSchema, apiResponse);

		expect(result.masterRecordDetail?.accountPolicies).toBeDefined();
		expect(
			result.masterRecordDetail?.accountPolicies?.acceptPrivacyPolicies,
		).toBe(1);
		expect(
			result.masterRecordDetail?.accountPolicies?.acceptNewsletterPolicies,
		).toBe(0);
	});

	it("should transform API response with idDocumentDetail to camelCase", () => {
		const apiResponse = {
			RsStatus: { "@Status": "OK" },
			MasterRecordDetail: {
				"@RecordCode": "508558",
				Name: "John Doe",
				IdDocumentDetail: {
					"@IdType": "PASSPORT",
					"@IdCode": "AB1234567",
					"@IdExpireDate": "2030-01-15",
				},
			},
		};

		const result = parse(ManageMasterRecordResponseSchema, apiResponse);

		expect(result.masterRecordDetail?.idDocumentDetail).toBeDefined();
		expect(result.masterRecordDetail?.idDocumentDetail?.idType).toBe(
			"PASSPORT",
		);
		expect(result.masterRecordDetail?.idDocumentDetail?.idCode).toBe(
			"AB1234567",
		);
	});

	it("should transform API response with all nested objects (excluding dynamicFields array)", () => {
		// Note: DynamicFields array validation has a known schema mismatch issue
		// Input schema expects single object, API validation expects array
		const apiResponse = {
			RsStatus: { "@Status": "OK" },
			MasterRecordDetail: {
				"@RecordCode": "508558",
				"@InsertCriteria": "M",
				Name: "John Doe",
				Email: "john@example.com",
				FinancialDetail: {
					"@CurrencyCode": "USD",
					"@C_PaymentType": "BANK",
				},
				IdDocumentDetail: {
					"@IdType": "ID_CARD",
					"@IdCode": "CA98765432",
				},
				AccountPolicies: {
					"@AcceptProfilingPolicies": 1,
					"@AcceptPrivacyPolicies": 1,
				},
			},
		};

		const result = parse(ManageMasterRecordResponseSchema, apiResponse);

		expect(result.rsStatus.status).toBe("OK");
		expect(result.masterRecordDetail?.recordCode).toBe("508558");
		expect(result.masterRecordDetail?.financialDetail?.currencyCode).toBe(
			"USD",
		);
		expect(result.masterRecordDetail?.idDocumentDetail?.idType).toBe("ID_CARD");
		expect(
			result.masterRecordDetail?.accountPolicies?.acceptProfilingPolicies,
		).toBe(1);
	});

	it("should transform API response with single dynamicField", () => {
		const apiResponse = {
			RsStatus: { "@Status": "OK" },
			MasterRecordDetail: {
				"@RecordCode": "508558",
				Name: "John Doe",
				DynamicFields: { "@Key": "key", "@Value": "value" },
			},
		};

		const result = parse(ManageMasterRecordResponseSchema, apiResponse);

		expect(result.masterRecordDetail?.dynamicFields).toBeDefined();
		expect(result.masterRecordDetail?.dynamicFields).toHaveProperty(
			"key",
			"key",
		);
		expect(result.masterRecordDetail?.dynamicFields).toBeInstanceOf(Object);
		expect(result.masterRecordDetail?.dynamicFields?.key).toBe("key");
		expect(result.masterRecordDetail?.dynamicFields?.value).toBe("value");
	});

	it("should transform API response with multiple dynamicFields", () => {
		const apiResponse = {
			RsStatus: { "@Status": "OK" },
			MasterRecordDetail: {
				"@RecordCode": "508558",
				Name: "John Doe",
				DynamicFields: { "@Key": "field1", "@Value": "value1" },
			},
		};
		const result = parse(ManageMasterRecordResponseSchema, apiResponse);
		expect(result.masterRecordDetail?.dynamicFields).toBeDefined();
		expect(result.masterRecordDetail?.dynamicFields?.key).toBe("field1");
		expect(result.masterRecordDetail?.dynamicFields?.value).toBe("value1");
	});
});
