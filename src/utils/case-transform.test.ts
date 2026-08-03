import { describe, expect, it } from "vitest";
import { camelToPascalKeys, pascalToCamelKeys } from "./case-transform.js";
import {
	dynamicFieldsWire,
	headerWire,
	masterRecordWire,
	searchMasterWire,
} from "./wire-shapes.js";

describe("case-transform", () => {
	describe("pascalToCamelKeys", () => {
		it("should convert PascalCase keys to camelCase", () => {
			const input = {
				SearchType: "CODE",
				RecordCode: "508558",
				Name: "John Doe",
			};

			expect(pascalToCamelKeys(input)).toEqual({
				searchType: "CODE",
				recordCode: "508558",
				name: "John Doe",
			});
		});

		it("should strip @ prefix and camelCase the rest", () => {
			expect(
				pascalToCamelKeys({
					"@HostID": "025706",
					"@Xtoken": "TOKEN002756",
					"@Status": "OK",
				}),
			).toEqual({
				hostID: "025706",
				xtoken: "TOKEN002756",
				status: "OK",
			});
		});

		it("should handle nested objects", () => {
			expect(
				pascalToCamelKeys({
					RsStatus: { "@Status": "OK", ErrorCode: "123" },
					MasterRecordList: { MasterRecordDetail: [] },
				}),
			).toEqual({
				rsStatus: { status: "OK", errorCode: "123" },
				masterRecordList: { masterRecordDetail: [] },
			});
		});

		it("should handle arrays", () => {
			const result = pascalToCamelKeys({
				items: [
					{ Name: "Item 1", Value: 10 },
					{ Name: "Item 2", Value: 20 },
				],
			});
			expect(result.items).toEqual([
				{ name: "Item 1", value: 10 },
				{ name: "Item 2", value: 20 },
			]);
		});

		it("should preserve special objects", () => {
			const date = new Date("2024-01-01");
			const result = pascalToCamelKeys({ CreatedDate: date, Name: "Test" });
			expect(result.createdDate).toBe(date);
			expect(result.name).toBe("Test");
		});

		it("should handle null and primitives", () => {
			expect(pascalToCamelKeys(null)).toBe(null);
			expect(pascalToCamelKeys(42)).toBe(42);
			expect(pascalToCamelKeys("string")).toBe("string");
			expect(pascalToCamelKeys(true)).toBe(true);
		});
	});

	describe("camelToPascalKeys with WireShape", () => {
		it("without shape treats all keys as elements", () => {
			expect(
				camelToPascalKeys({
					searchType: "CODE",
					recordCode: "508558",
					name: "John Doe",
				}),
			).toEqual({
				SearchType: "CODE",
				RecordCode: "508558",
				Name: "John Doe",
			});
		});

		it("applies attrs only for the current shape", () => {
			expect(
				camelToPascalKeys(
					{ recordCode: "508558", name: "John Doe", insertCriteria: "T" },
					masterRecordWire,
				),
			).toEqual({
				"@RecordCode": "508558",
				Name: "John Doe",
				"@InsertCriteria": "T",
			});
		});

		it("does not leak attrs across shapes (name stays element)", () => {
			expect(
				camelToPascalKeys(
					{ code: "HTL", name: "Hotel" },
					{ attrs: ["code", "name"] },
				),
			).toEqual({ "@Code": "HTL", "@Name": "Hotel" });

			expect(camelToPascalKeys({ name: "John Doe" }, masterRecordWire)).toEqual(
				{ Name: "John Doe" },
			);
		});

		it("uses child shapes for nested objects", () => {
			expect(
				camelToPascalKeys(
					{
						recordCode: "508558",
						financialDetail: { currencyCode: "EUR", creditLimit: "1000" },
					},
					masterRecordWire,
				),
			).toEqual({
				"@RecordCode": "508558",
				FinancialDetail: {
					"@CurrencyCode": "EUR",
					"@CreditLimit": "1000",
				},
			});
		});

		it("applies the same child shape to array items", () => {
			expect(
				camelToPascalKeys(
					[
						{ key: "a", value: "1" },
						{ key: "b", value: "2" },
					],
					dynamicFieldsWire,
				),
			).toEqual([
				{ "@Key": "a", "@Value": "1" },
				{ "@Key": "b", "@Value": "2" },
			]);
		});

		it("preserves camelCase attr names when listed", () => {
			expect(
				camelToPascalKeys(
					{ sCode: "HT1", ssCode: "DL", qty: "1" },
					{
						attrs: ["sCode", "ssCode"],
						preserveCamel: ["sCode", "ssCode"],
					},
				),
			).toEqual({ "@sCode": "HT1", "@ssCode": "DL", Qty: "1" });
		});

		it("search master keeps recordCode as element", () => {
			expect(
				camelToPascalKeys(
					{
						searchType: "CODE",
						recordCode: "508558",
						lastModificationDate: {
							minDate: "2024-01-01",
							maxDate: "2024-12-31",
						},
					},
					searchMasterWire,
				),
			).toEqual({
				SearchType: "CODE",
				RecordCode: "508558",
				LastModificationDate: {
					"@MinDate": "2024-01-01",
					"@MaxDate": "2024-12-31",
				},
			});
		});

		it("header wire marks auth fields as attrs", () => {
			expect(
				camelToPascalKeys(
					{
						hostID: "025706",
						xtoken: "TOKEN",
						status: "OK",
						name: "Test",
					},
					headerWire,
				),
			).toEqual({
				"@HostID": "025706",
				"@Xtoken": "TOKEN",
				"@Status": "OK",
				Name: "Test",
			});
		});
	});

	describe("round-trip", () => {
		it("round-trips with masterRecordWire", () => {
			const wire = {
				"@RecordCode": "508558",
				"@HostID": "025706",
				Name: "John",
			};
			const camel = pascalToCamelKeys(wire);
			expect(camel).toEqual({
				recordCode: "508558",
				hostID: "025706",
				name: "John",
			});
			expect(
				camelToPascalKeys(camel, {
					attrs: ["recordCode", "hostID"],
				}),
			).toEqual(wire);
		});
	});
});
