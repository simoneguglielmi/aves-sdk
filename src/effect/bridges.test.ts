import { Effect, Schema } from "effect";
import { describe, expect, it } from "vitest";
import { apiError, validationError } from "../error.js";
import { formatParseError, isParseError } from "./parse-error.js";
import { fromResult, runToResult } from "./run-result.js";
import { decodeUnknownAves, parse, safeParse } from "./schema-parse.js";

describe("schema-parse", () => {
	const Person = Schema.Struct({
		name: Schema.String,
		age: Schema.Number,
	});

	it("parse returns decoded value", () => {
		expect(parse(Person, { name: "Ada", age: 36 })).toEqual({
			name: "Ada",
			age: 36,
		});
	});

	it("parse throws ParseError on invalid input", () => {
		expect(() => parse(Person, { name: "Ada" })).toThrow();
	});

	it("safeParse soft-fails with issues", () => {
		const result = safeParse(Person, {});
		expect(result.success).toBe(false);
		if (result.success) return;
		expect(isParseError(result.error)).toBe(true);
		expect(result.issues[0]?.message.length).toBeGreaterThan(0);
		expect(formatParseError(result.error)).toContain("name");
	});
});

describe("runToResult", () => {
	it("maps success", async () => {
		const result = await runToResult(Effect.succeed(42));
		expect(result).toEqual({ success: true, data: 42 });
	});

	it("maps AvesError failure", async () => {
		const result = await runToResult(Effect.fail(validationError("bad")));
		expect(result.success).toBe(false);
		if (result.success) return;
		expect(result.error.kind).toBe("validation");
		expect(result.error.message).toBe("bad");
	});

	it("fromResult round-trips", async () => {
		const ok = await runToResult(fromResult({ success: true, data: "x" }));
		expect(ok).toEqual({ success: true, data: "x" });
		const fail = await runToResult(
			fromResult({
				success: false,
				error: apiError("nope", "ERROR", 1),
			}),
		);
		expect(fail.success).toBe(false);
		if (fail.success) return;
		expect(fail.error.kind).toBe("api");
	});
});

describe("TaggedError catchTag", () => {
	it("recovers by _tag", async () => {
		const program = Effect.fail(apiError("boom", "ERROR", 42)).pipe(
			Effect.catchTag("AvesApiError", (e) =>
				Effect.succeed(`caught:${e.code}`),
			),
		);
		await expect(Effect.runPromise(program)).resolves.toBe("caught:42");
	});
});

describe("decodeUnknownAves", () => {
	const Person = Schema.Struct({
		name: Schema.String,
		age: Schema.Number,
	});

	it("succeeds on valid input", async () => {
		const value = await Effect.runPromise(
			decodeUnknownAves(Person, { name: "Ada", age: 36 }),
		);
		expect(value).toEqual({ name: "Ada", age: 36 });
	});

	it("fails as AvesValidationError", async () => {
		const program = decodeUnknownAves(
			Person,
			{ name: "Ada" },
			"bad person",
		).pipe(
			Effect.catchTag("AvesValidationError", (e) => Effect.succeed(e.message)),
		);
		const message = await Effect.runPromise(program);
		expect(message).toContain("bad person");
	});
});
