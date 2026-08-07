import { ParseResult } from "effect";

/** Format an Effect `ParseError` into a compact validation message. */
export function formatParseError(error: ParseResult.ParseError): string {
	return ParseResult.TreeFormatter.formatErrorSync(error);
}

export function isParseError(error: unknown): error is ParseResult.ParseError {
	return (
		typeof error === "object" &&
		error !== null &&
		"_tag" in error &&
		(error as { _tag: string })._tag === "ParseError"
	);
}
