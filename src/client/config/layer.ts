import { Layer } from "effect";
import type { AvesClientOptions } from "../../types.js";
import { AvesConfig } from "./tag.js";

export const AvesConfigLive = (
	options: AvesClientOptions,
): Layer.Layer<AvesConfig> => Layer.succeed(AvesConfig, options);
