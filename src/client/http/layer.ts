import { Effect, Layer } from "effect";
import { HttpClient } from "effect/http";
import { AvesConfig } from "../config/tag.js";
import { makeAvesHttp } from "./service.js";
import { AvesHttp } from "./tag.js";

/**
 * Live AVES HTTP — requires {@link AvesConfig} + `effect/http` {@link HttpClient}.
 * Provide {@link fetchHttpLayer} or {@link httpClientLayer} underneath.
 */
export const AvesHttpLive: Layer.Layer<
	AvesHttp,
	never,
	AvesConfig | HttpClient.HttpClient
> = Layer.effect(
	AvesHttp,
	Effect.gen(function* () {
		const { baseURL, timeoutMs } = yield* AvesConfig;
		const http = yield* HttpClient.HttpClient;
		return makeAvesHttp({ baseURL, timeoutMs }, http);
	}),
);
