import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { AvesApiError } from "../../error.js";
import { StatusOnlyResponseSchema } from "../../schemas/common.js";
import {
	readAvesResponse,
	readAvesResponseEffect,
	requireRsStatusOk,
} from "./response-reader.js";

const okStatus = {
	status: "OK" as const,
	errorCode: undefined,
	errorDescription: undefined,
	warnings: undefined,
};

describe("requireRsStatusOk", () => {
	it("passes OK", async () => {
		const out = await Effect.runPromise(
			requireRsStatusOk({ rsStatus: okStatus }),
		);
		expect(out.rsStatus.status).toBe("OK");
	});

	it("fails non-OK as AvesApiError", async () => {
		const msg = await Effect.runPromise(
			requireRsStatusOk({
				rsStatus: {
					status: "ERROR" as const,
					errorCode: 7,
					errorDescription: "nope",
					warnings: undefined,
				},
			}).pipe(
				Effect.catchTag("AvesApiError", (e) =>
					Effect.succeed(`${e.code}:${e.message}`),
				),
			),
		);
		expect(msg).toBe("7:nope");
	});
});

describe("readAvesResponseEffect", () => {
	it("decodes OK xml", async () => {
		const xml = `<FooRS><RsStatus Status="OK"/></FooRS>`;
		const data = await Effect.runPromise(
			readAvesResponseEffect(xml, "FooRS", StatusOnlyResponseSchema),
		);
		expect(data.rsStatus.status).toBe("OK");
	});

	it("fails missing root as AvesValidationError", async () => {
		const msg = await Effect.runPromise(
			readAvesResponseEffect(
				"<Other/>",
				"FooRS",
				StatusOnlyResponseSchema,
			).pipe(
				Effect.catchTag("AvesValidationError", (e) =>
					Effect.succeed(e.message),
				),
			),
		);
		expect(msg).toContain("FooRS");
	});

	it("sync Result adapter matches Effect path", () => {
		const xml = `<FooRS><RsStatus Status="ERROR"><ErrorCode>1</ErrorCode></RsStatus></FooRS>`;
		const result = readAvesResponse(xml, "FooRS", StatusOnlyResponseSchema);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBeInstanceOf(AvesApiError);
			expect(result.error.code).toBe(1);
		}
	});
});
