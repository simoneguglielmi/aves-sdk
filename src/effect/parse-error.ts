import { Schema, SchemaIssue } from "effect";

const formatIssue = SchemaIssue.makeFormatterDefault();

/** Format an Effect `SchemaError` into a compact validation message. */
export function formatParseError(error: Schema.SchemaError): string {
	return formatIssue(error.issue);
}

export function isParseError(error: unknown): error is Schema.SchemaError {
	return Schema.isSchemaError(error);
}
