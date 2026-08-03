import XMLBuilder from "fast-xml-builder";
import { XMLParser } from "fast-xml-parser";
import { AvesError } from "../error.js";

const parserOptions = {
	ignoreAttributes: false,
	attributeNamePrefix: "@",
	parseAttributeValue: false,
	trimValues: true,
	ignoreNameSpace: true,
	removeNSPrefix: true,
	parseTagValue: false,
};

const builderOptions = {
	ignoreAttributes: false,
	attributeNamePrefix: "@",
	suppressEmptyNode: true,
};

const parser = new XMLParser(parserOptions);
const builder = new XMLBuilder(builderOptions);

/**
 * Converts JSON to XML string
 */
export function jsonToXml(json: Record<string, unknown>): string {
	try {
		return builder.build(json);
	} catch (error) {
		throw new AvesError(
			"validation",
			`Failed to convert JSON to XML: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

/**
 * Converts XML string to JSON object
 * Attributes are parsed with @ prefix
 */
export function xmlToJson(xml: string): Record<string, unknown> {
	try {
		return parser.parse(xml);
	} catch (error) {
		throw new AvesError(
			"validation",
			`Failed to convert XML to JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}
