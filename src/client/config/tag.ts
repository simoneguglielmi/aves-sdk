import { Context } from "effect";
import type { AvesClientOptions } from "../../types.js";

/** Client options (baseURL, credentials, languageCode, …). */
export class AvesConfig extends Context.Service<
	AvesConfig,
	AvesClientOptions
>()("aves/Config") {}
