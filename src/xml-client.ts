import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@',
  textNodeName: '_text',
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
  textNodeName: '_text',
  format: true,
  suppressEmptyNode: false,
};

const parser = new XMLParser(parserOptions);
const builder = new XMLBuilder(builderOptions);

/**
 * Converts a JSON object to XML string
 */
export function jsonToXml(json: Record<string, unknown>): string {
  return builder.build(json);
}

/**
 * Converts an XML string to JSON object
 */
export function xmlToJson(xml: string): Record<string, unknown> {
  return parser.parse(xml) as Record<string, unknown>;
}
