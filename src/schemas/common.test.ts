import { parse } from "valibot";
import { describe, expect, it } from "vitest";
import { RqHeaderSchema, RsStatusSchema } from "./common.js";

describe("RqHeaderSchema", () => {
	it("should validate valid request header", () => {
		const input = {
			"@HostID": "025706",
			"@Xtoken": "TOKEN002756",
			"@Interface": "WEB",
			"@UserName": "WEB",
		};

		const result = parse(RqHeaderSchema, input);
		expect(result).toBeDefined();
		expect(result["@HostID"]).toBe("025706");
		expect(result["@Xtoken"]).toBe("TOKEN002756");
	});

	it("should accept optional LanguageCode", () => {
		const input = {
			"@HostID": "025706",
			"@Xtoken": "TOKEN002756",
			"@Interface": "WEB",
			"@UserName": "WEB",
			"@LanguageCode": "02",
		};

		const result = parse(RqHeaderSchema, input);
		expect(result["@LanguageCode"]).toBe("02");
	});

	it("should reject invalid HostID length", () => {
		const input = {
			"@HostID": "12345", // Too short (must be 6)
			"@Xtoken": "TOKEN002756",
			"@Interface": "WEB",
			"@UserName": "WEB",
		};

		expect(() => parse(RqHeaderSchema, input)).toThrow();
	});

	it("should reject invalid Interface value", () => {
		const input = {
			"@HostID": "025706",
			"@Xtoken": "TOKEN002756",
			"@Interface": "INVALID", // Must be 'WEB'
			"@UserName": "WEB",
		};

		expect(() => parse(RqHeaderSchema, input)).toThrow();
	});

	it("should reject invalid UserName value", () => {
		const input = {
			"@HostID": "025706",
			"@Xtoken": "TOKEN002756",
			"@Interface": "WEB",
			"@UserName": "INVALID", // Must be 'WEB'
		};

		expect(() => parse(RqHeaderSchema, input)).toThrow();
	});

	it("should reject invalid LanguageCode length", () => {
		const input = {
			"@HostID": "025706",
			"@Xtoken": "TOKEN002756",
			"@Interface": "WEB",
			"@UserName": "WEB",
			"@LanguageCode": "1", // Too short (must be 2)
		};

		expect(() => parse(RqHeaderSchema, input)).toThrow();
	});
});

describe("RsStatusSchema", () => {
	it("should validate OK status", () => {
		const input = {
			"@Status": "OK",
		};

		const result = parse(RsStatusSchema, input);
		expect(result.status).toBe("OK");
	});

	it("should validate ERROR status with error details", () => {
		const input = {
			"@Status": "ERROR",
			ErrorCode: 1001,
			ErrorDescription: "Invalid request",
		};

		const result = parse(RsStatusSchema, input);
		expect(result.status).toBe("ERROR");
		expect(result.errorCode).toBe(1001);
		expect(result.errorDescription).toBe("Invalid request");
	});

	it("should validate WARNING status with warnings", () => {
		const input = {
			"@Status": "WARNING",
			Warnings: "Some warning message",
		};

		const result = parse(RsStatusSchema, input);
		expect(result.status).toBe("WARNING");
		expect(result.warnings).toBe("Some warning message");
	});

	it("should validate TIMEOUT status", () => {
		const input = {
			"@Status": "TIMEOUT",
		};

		const result = parse(RsStatusSchema, input);
		expect(result.status).toBe("TIMEOUT");
	});

	it("should reject invalid status value", () => {
		const input = {
			"@Status": "INVALID",
		};

		expect(() => parse(RsStatusSchema, input)).toThrow();
	});
});
