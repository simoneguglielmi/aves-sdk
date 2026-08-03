import { describe, expect, it } from "vitest";
import { jsonToXml, xmlToJson } from "./client.js";

describe("xml/client", () => {
	describe("jsonToXml", () => {
		it("should convert simple JSON to XML", () => {
			const json = {
				root: {
					name: "John",
					age: 30,
				},
			};

			const xml = jsonToXml(json);
			expect(xml).toContain("<root>");
			expect(xml).toContain("<name>John</name>");
			expect(xml).toContain("<age>30</age>");
		});

		it("should handle attributes with @ prefix", () => {
			const json = {
				element: {
					"@id": "123",
					"@status": "active",
					value: "test",
				},
			};

			const xml = jsonToXml(json);
			expect(xml).toContain('id="123"');
			expect(xml).toContain('status="active"');
			expect(xml).toContain("<value>test</value>");
		});

		it("should handle nested objects", () => {
			const json = {
				root: {
					nested: {
						value: "test",
					},
				},
			};

			const xml = jsonToXml(json);
			expect(xml).toContain("<root>");
			expect(xml).toContain("<nested>");
			expect(xml).toContain("<value>test</value>");
		});

		it("should handle arrays", () => {
			const json = {
				items: {
					item: ["one", "two", "three"],
				},
			};

			const xml = jsonToXml(json);
			expect(xml).toContain("<item>one</item>");
			expect(xml).toContain("<item>two</item>");
			expect(xml).toContain("<item>three</item>");
		});
	});

	describe("xmlToJson", () => {
		it("should convert simple XML to JSON", () => {
			const xml = "<root><name>John</name><age>30</age></root>";
			const json = xmlToJson(xml) as { root: { name: string; age: string } };

			expect(json).toHaveProperty("root");
			expect(json.root).toHaveProperty("name", "John");
			expect(json.root).toHaveProperty("age", "30");
		});

		it("should handle attributes", () => {
			const xml =
				'<element id="123" status="active"><value>test</value></element>';
			const json = xmlToJson(xml) as {
				element: { "@id": string; "@status": string; value: string };
			};

			// XML parser may convert numeric strings to numbers
			expect(json.element).toHaveProperty("@id");
			expect(String(json.element["@id"])).toBe("123");
			expect(json.element).toHaveProperty("@status", "active");
			expect(json.element).toHaveProperty("value", "test");
		});

		it("should handle nested structures", () => {
			const xml = "<root><nested><value>test</value></nested></root>";
			const json = xmlToJson(xml) as {
				root: { nested: { value: string } };
			};

			expect(json.root).toHaveProperty("nested");
			expect(json.root.nested).toHaveProperty("value", "test");
		});

		it("should handle arrays", () => {
			const xml =
				"<items><item>one</item><item>two</item><item>three</item></items>";
			const json = xmlToJson(xml) as {
				items: { item: string[] };
			};

			expect(json.items).toHaveProperty("item");
			expect(Array.isArray(json.items.item)).toBe(true);
			expect(json.items.item).toHaveLength(3);
		});

		it("should parse AVES API response structure", () => {
			const xml = `
        <SearchMasterRecordRS>
          <RsStatus Status="OK"/>
          <MasterRecordList>
            <MasterRecordDetail RecordCode="508558">
              <Name>ROSSI MARIO</Name>
              <Email>mario.rossi@example.com</Email>
            </MasterRecordDetail>
          </MasterRecordList>
        </SearchMasterRecordRS>
      `;

			const json = xmlToJson(xml) as {
				SearchMasterRecordRS: {
					RsStatus: { "@Status": string };
					MasterRecordList: unknown;
				};
			};
			expect(json).toHaveProperty("SearchMasterRecordRS");
			expect(json.SearchMasterRecordRS).toHaveProperty("RsStatus");
			expect(json.SearchMasterRecordRS.RsStatus).toHaveProperty(
				"@Status",
				"OK",
			);
			expect(json.SearchMasterRecordRS).toHaveProperty("MasterRecordList");
		});

		it("should preserve leading zeros in record codes", () => {
			const xml = `
        <MasterRecordDetail RecordCode="017627">
          <Name>Test User</Name>
        </MasterRecordDetail>
      `;

			const json = xmlToJson(xml) as {
				MasterRecordDetail: {
					"@RecordCode": string;
					Name: string;
				};
			};

			expect(json.MasterRecordDetail["@RecordCode"]).toBe("017627");
			expect(json.MasterRecordDetail.Name).toBe("Test User");
		});
	});

	describe("round-trip conversion", () => {
		it("should convert JSON to XML and back to JSON", () => {
			const original = {
				root: {
					"@id": "123",
					name: "John",
					nested: {
						value: "test",
					},
				},
			};

			const xml = jsonToXml(original);
			const converted = xmlToJson(xml) as {
				root: {
					"@id": number | string;
					name: string;
					nested: { value: string };
				};
			};

			// XML parser may convert numeric strings to numbers
			expect(converted.root).toHaveProperty("@id");
			expect(String(converted.root["@id"])).toBe("123");
			expect(converted.root).toHaveProperty("name", "John");
			expect(converted.root.nested).toHaveProperty("value", "test");
		});
	});
});
