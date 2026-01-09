import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@',
  parseAttributeValue: true,
  parseTrueNumberOnly: false,
  trimValues: true,
  ignoreNameSpace: true,
  removeNSPrefix: true,
  parseTagValue: true,
};

const builderOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@',
  suppressEmptyNode: false,
};

const parser = new XMLParser(parserOptions);
const builder = new XMLBuilder(builderOptions);

/**
 * Converts JSON to XML string
 */
export function jsonToXml(json: Record<string, unknown>): string {
  return builder.build(json);
}

/**
 * Converts XML string to JSON object
 * Attributes are parsed with @ prefix
 */
export function xmlToJson(xml: string): Record<string, unknown> {
  return parser.parse(xml);
}
