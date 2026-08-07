import { Effect, Layer } from "effect";
import { AvesConfig } from "../config/tag.js";
import { AvesHttp } from "../http/tag.js";
import { makeAvesTransport } from "./service.js";
import { AvesTransport } from "./tag.js";

/** Live transport — requires {@link AvesConfig} + {@link AvesHttp}. */
export const AvesTransportLive = Layer.effect(
	AvesTransport,
	Effect.gen(function* () {
		return makeAvesTransport({
			options: yield* AvesConfig,
			http: yield* AvesHttp,
		});
	}),
);
