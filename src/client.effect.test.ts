import {
	HttpClient,
	HttpClientError,
	type HttpClientRequest,
	HttpClientResponse,
} from "@effect/platform";
import { Effect } from "effect";
import { afterEach, describe, expect, it } from "vitest";
import { AvesBooking } from "./client/booking/index.js";
import type { AvesHttpService } from "./client/http/types.js";
import { AvesMaster } from "./client/master/index.js";
import type { MasterRecordsService } from "./client/master/types.js";
import { AvesPackages } from "./client/packages/index.js";
import { AvesTransport } from "./client/transport/index.js";
import {
	AvesClient,
	AvesClientLive,
	avesClientLayer,
	createAvesClient,
	makeAvesRuntime,
} from "./client.js";
import {
	AvesApiError,
	AvesValidationError,
	apiError,
	isAvesError,
	validationError,
} from "./error.js";

type MockReply = { status?: number; body: string };
type MockRequest = { method: string; path: string; body: string };

const opts = {
	baseURL: "https://api.example.com",
	hostID: "000000",
	xtoken: "TOKEN000000",
} as const;

const searchOkXml = `<SearchMasterRecordRS>
  <RsStatus Status="OK"/>
  <MasterRecordList>
    <MasterRecordDetail RecordCode="508558">
      <Name>ROSSI MARIO</Name>
    </MasterRecordDetail>
  </MasterRecordList>
</SearchMasterRecordRS>`;

const searchApiErrorXml = `<SearchMasterRecordRS>
  <RsStatus Status="ERROR">
    <ErrorCode>1001</ErrorCode>
    <ErrorDescription>Invalid request</ErrorDescription>
  </RsStatus>
</SearchMasterRecordRS>`;

const requestBodyText = (
	request: HttpClientRequest.HttpClientRequest,
): string => {
	const { body } = request;
	if (body._tag === "Uint8Array") return new TextDecoder().decode(body.body);
	if (body._tag === "Raw" && typeof body.body === "string") return body.body;
	return "";
};

const mockHttp = (onRequest: (req: MockRequest) => MockReply | string) =>
	HttpClient.make((request, url) => {
		const reply = onRequest({
			method: request.method,
			path: url.pathname,
			body: requestBodyText(request),
		});
		const status = typeof reply === "string" ? 200 : (reply.status ?? 200);
		const body = typeof reply === "string" ? reply : reply.body;
		return Effect.succeed(
			HttpClientResponse.fromWeb(request, new Response(body, { status })),
		);
	});

const okSearchHttp = () => mockHttp(() => searchOkXml);

describe("Effect client DX", () => {
	const runtimes: { dispose: () => Promise<void> }[] = [];

	afterEach(async () => {
		await Promise.all(runtimes.splice(0).map((r) => r.dispose()));
	});

	it("Promise facade has domains only (no transport)", () => {
		const client = createAvesClient(opts, { httpClient: okSearchHttp() });
		expect(client).toHaveProperty("master");
		expect(client).toHaveProperty("booking");
		expect(client).toHaveProperty("packages");
		expect(client).not.toHaveProperty("transport");
		expect(
			new AvesClient(opts, { httpClient: okSearchHttp() }),
		).not.toHaveProperty("transport");
	});

	it("yield* AvesMaster via avesClientLayer", async () => {
		const program = Effect.gen(function* () {
			const master = yield* AvesMaster;
			return yield* master.search({
				searchType: "CODE",
				recordCode: "508558",
			});
		}).pipe(
			Effect.provide(avesClientLayer(opts, { httpClient: okSearchHttp() })),
		);

		const data = await Effect.runPromise(program);
		expect(data).toHaveLength(1);
		expect(data[0]?.recordCode).toBe("508558");
	});

	it("makeAvesRuntime runs domain Effects", async () => {
		const runtime = makeAvesRuntime(opts, { httpClient: okSearchHttp() });
		runtimes.push(runtime);

		const data = await runtime.runPromise(
			Effect.gen(function* () {
				const master = yield* AvesMaster;
				return yield* master.search({
					searchType: "CODE",
					recordCode: "508558",
				});
			}),
		);

		expect(data[0]?.name).toBe("ROSSI MARIO");
	});

	it("AvesClientLive and avesClientLayer both expose app tags", async () => {
		const probe = Effect.gen(function* () {
			yield* AvesMaster;
			yield* AvesBooking;
			yield* AvesPackages;
			yield* AvesTransport;
			return true;
		});

		await expect(
			Effect.runPromise(
				probe.pipe(
					Effect.provide(avesClientLayer(opts, { httpClient: okSearchHttp() })),
				),
			),
		).resolves.toBe(true);

		await expect(
			Effect.runPromise(probe.pipe(Effect.provide(AvesClientLive(opts)))),
		).resolves.toBe(true);
	});

	it("deps.master overrides domain without hitting HTTP", async () => {
		const master: MasterRecordsService = {
			search: () => Effect.succeed([]),
			upsert: () => Effect.fail(validationError("upsert blocked")),
		};
		const client = createAvesClient(opts, {
			master,
			httpClient: mockHttp(() => {
				throw new Error("HTTP should not run");
			}),
		});
		const result = await client.master.search({
			searchType: "CODE",
			recordCode: "508558",
		});
		expect(result).toEqual({ success: true, data: [] });
	});

	it("deps.http overrides AvesHttp", async () => {
		const http: AvesHttpService = {
			post: () => Effect.fail(apiError("from-deps-http", "ERROR", 999)),
		};
		const client = createAvesClient(opts, { http });
		const result = await client.master.search({
			searchType: "CODE",
			recordCode: "508558",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBeInstanceOf(AvesApiError);
			expect(result.error.message).toBe("from-deps-http");
			expect(result.error.code).toBe(999);
		}
	});

	it("catchTag recovers AvesApiError from a real op", async () => {
		const program = Effect.gen(function* () {
			const master = yield* AvesMaster;
			return yield* master.search({
				searchType: "CODE",
				recordCode: "508558",
			});
		}).pipe(
			Effect.provide(
				avesClientLayer(opts, {
					httpClient: mockHttp(() => searchApiErrorXml),
				}),
			),
			Effect.catchTag("AvesApiError", (e) =>
				Effect.succeed({ recovered: true as const, code: e.code }),
			),
		);

		await expect(Effect.runPromise(program)).resolves.toEqual({
			recovered: true,
			code: 1001,
		});
	});

	it("maps request timeout to AvesApiError TIMEOUT", async () => {
		const hang = HttpClient.make(() => Effect.never);
		const client = createAvesClient(
			{ ...opts, timeoutMs: 40 },
			{ httpClient: hang },
		);
		const result = await client.master.search({
			searchType: "CODE",
			recordCode: "508558",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(isAvesError(result.error)).toBe(true);
			expect(result.error.kind).toBe("api");
			expect(result.error.status).toBe("TIMEOUT");
			expect(result.error.message).toContain("timed out");
		}
	});

	it("maps HttpClient RequestError to AvesApiError", async () => {
		const failing = HttpClient.make((request) =>
			Effect.fail(
				new HttpClientError.RequestError({
					request,
					reason: "Transport",
					description: "offline",
				}),
			),
		);
		const client = createAvesClient(opts, { httpClient: failing });
		const result = await client.master.search({
			searchType: "CODE",
			recordCode: "508558",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBeInstanceOf(AvesApiError);
			expect(result.error.kind).toBe("api");
			expect(result.error.message).toContain("Transport");
		}
	});

	it("validation failures are AvesValidationError", async () => {
		const client = createAvesClient(opts, { httpClient: okSearchHttp() });
		const result = await client.master.search({
			searchType: "CODE",
			recordCode: "1234",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBeInstanceOf(AvesValidationError);
			expect(result.error._tag).toBe("AvesValidationError");
			expect(result.error.kind).toBe("validation");
		}
	});
});
