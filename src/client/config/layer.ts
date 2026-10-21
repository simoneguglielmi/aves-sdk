import { Layer } from "effect";
import type { AvesClientOptions } from "../../types.js";
import { resolveTimeoutMs } from "./resolve-timeout-ms.js";
import { AvesConfig } from "./tag.js";

/** Validates the options once, at build time, for the Promise facade and Effect Layers alike. */
export const AvesConfigLive = (
	options: AvesClientOptions,
): Layer.Layer<AvesConfig> =>
	Layer.succeed(AvesConfig, {
		...options,
		timeoutMs: resolveTimeoutMs(options.timeoutMs),
	});
