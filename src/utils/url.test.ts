import { describe, expect, it } from "vitest";
import { AvesValidationError } from "../error.js";
import { parseUrl } from "./url.js";

describe("url", () => {
	describe("parseUrl", () => {
		it("should combine baseURL and endpoint correctly", () => {
			const result = parseUrl("https://api.example.com", "/test/endpoint");
			expect(result).toBe("https://api.example.com/test/endpoint");
		});

		it("should handle baseURL with trailing slash", () => {
			const result = parseUrl("https://api.example.com/", "/test/endpoint");
			expect(result).toBe("https://api.example.com/test/endpoint");
		});

		it("should handle http protocol", () => {
			const result = parseUrl("http://api.example.com", "/test");
			expect(result).toBe("http://api.example.com/test");
		});

		it("should handle https protocol", () => {
			const result = parseUrl("https://api.example.com", "/test");
			expect(result).toBe("https://api.example.com/test");
		});

		it("should handle endpoints with query parameters", () => {
			const result = parseUrl("https://api.example.com", "/test?param=value");
			expect(result).toBe("https://api.example.com/test?param=value");
		});

		it("should handle endpoints with path segments", () => {
			const result = parseUrl(
				"https://api.example.com",
				"/interop/masterRecords/v2/rest/Search",
			);
			expect(result).toBe(
				"https://api.example.com/interop/masterRecords/v2/rest/Search",
			);
		});

		it("should reject endpoint without leading slash", () => {
			expect(() =>
				parseUrl("https://api.example.com", "test/endpoint"),
			).toThrow(AvesValidationError);
			expect(() =>
				parseUrl("https://api.example.com", "test/endpoint"),
			).toThrow(
				"Invalid endpoint: endpoint must start with '/' but got 'test/endpoint'",
			);
		});

		it("should reject empty endpoint", () => {
			expect(() => parseUrl("https://api.example.com", "")).toThrow(
				AvesValidationError,
			);
			expect(() => parseUrl("https://api.example.com", "")).toThrow(
				"Invalid endpoint: endpoint must start with '/' but got ''",
			);
		});

		it("should reject invalid baseURL format", () => {
			expect(() => parseUrl("not-a-url", "/test")).toThrow(AvesValidationError);
			expect(() => parseUrl("not-a-url", "/test")).toThrow("Invalid baseURL");
		});

		it("should reject baseURL without protocol", () => {
			expect(() => parseUrl("api.example.com", "/test")).toThrow(
				AvesValidationError,
			);
			expect(() => parseUrl("api.example.com", "/test")).toThrow(
				"Invalid baseURL",
			);
		});

		it("should reject ftp protocol", () => {
			expect(() => parseUrl("ftp://example.com", "/test")).toThrow(
				AvesValidationError,
			);
			expect(() => parseUrl("ftp://example.com", "/test")).toThrow(
				"Invalid protocol: baseURL must use http:// or https:// but got 'ftp:'",
			);
		});

		it("should reject file protocol", () => {
			expect(() => parseUrl("file:///path/to/file", "/test")).toThrow(
				AvesValidationError,
			);
			expect(() => parseUrl("file:///path/to/file", "/test")).toThrow(
				"Invalid protocol: baseURL must use http:// or https:// but got 'file:'",
			);
		});

		it("should handle baseURL with port", () => {
			const result = parseUrl("https://api.example.com:8080", "/test");
			expect(result).toBe("https://api.example.com:8080/test");
		});

		it("should handle baseURL with path (path is preserved and endpoint appended)", () => {
			// baseURL path is preserved and endpoint is appended
			const result = parseUrl("https://api.example.com/api/v1", "/test");
			expect(result).toBe("https://api.example.com/api/v1/test");
		});

		it("should handle baseURL with query parameters (query is replaced by endpoint)", () => {
			// Note: new URL(endpoint, baseURL) replaces query params of baseURL
			const result = parseUrl("https://api.example.com?key=value", "/test");
			expect(result).toBe("https://api.example.com/test");
		});

		it("should handle localhost", () => {
			const result = parseUrl("http://localhost:3000", "/test");
			expect(result).toBe("http://localhost:3000/test");
		});

		it("should handle IP address", () => {
			const result = parseUrl("http://192.168.1.1", "/test");
			expect(result).toBe("http://192.168.1.1/test");
		});

		it("should preserve endpoint query parameters", () => {
			const result = parseUrl(
				"https://api.example.com",
				"/test?id=123&name=test",
			);
			expect(result).toBe("https://api.example.com/test?id=123&name=test");
		});

		it("should handle endpoint with hash", () => {
			const result = parseUrl("https://api.example.com", "/test#section");
			expect(result).toBe("https://api.example.com/test#section");
		});
		it("should pass with correct baseURL", () => {
			const url = "https://api.example.com";
			const endpoint = `/interop/masterRecords/v2/rest/Search`;
			const result = parseUrl(url, endpoint);
			expect(result).toBe(`${url}${endpoint}`);
		});
	});
});
