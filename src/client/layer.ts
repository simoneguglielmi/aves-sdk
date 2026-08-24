import { Layer } from "effect";
import type { AvesClientOptions } from "../types.js";
import { AvesBooking, AvesBookingLive } from "./booking/index.js";
import { type AvesConfig, AvesConfigLive } from "./config/index.js";
import { AvesHttp, AvesHttpLive, httpClientLayer } from "./http/index.js";
import { layerOrSucceed } from "./layer-utils.js";
import { AvesMaster, AvesMasterLive } from "./master/index.js";
import { AvesPackages, AvesPackagesLive } from "./packages/index.js";
import { AvesTransport, AvesTransportLive } from "./transport/index.js";
import type { AvesClientDeps } from "./types.js";

export type AvesClientServices =
	| AvesConfig
	| AvesHttp
	| AvesTransport
	| AvesBooking
	| AvesMaster
	| AvesPackages;

export type AvesAppServices =
	| AvesTransport
	| AvesBooking
	| AvesMaster
	| AvesPackages;

export { layerFromDep, layerOrSucceed } from "./layer-utils.js";

/**
 * Application layer: domains + transport (fully resolved).
 *
 * {@link Layer.provideMerge} keeps Transport in the output while satisfying
 * domain requirements (Effect Layers composition pattern).
 */
export function avesClientLayer(
	options: AvesClientOptions,
	deps: AvesClientDeps = {},
): Layer.Layer<AvesAppServices> {
	const config = AvesConfigLive(options);
	const platformHttp = httpClientLayer(deps.httpClient);

	const http = layerOrSucceed(
		AvesHttp,
		AvesHttpLive.pipe(Layer.provide(config), Layer.provide(platformHttp)),
		deps.http,
	);

	const transport = layerOrSucceed(
		AvesTransport,
		AvesTransportLive.pipe(Layer.provide(http), Layer.provide(config)),
		deps.transport,
	);

	const domains = Layer.mergeAll(
		layerOrSucceed(AvesBooking, AvesBookingLive, deps.booking),
		layerOrSucceed(AvesMaster, AvesMasterLive, deps.master),
		layerOrSucceed(AvesPackages, AvesPackagesLive, deps.packages),
	);

	return domains.pipe(Layer.provideMerge(transport));
}

/**
 * Full stack including Config + Http (for `yield* AvesHttp` / `yield* AvesConfig`).
 * Single shared Config/Http/Transport instance (no duplicate provides).
 */
export function AvesClientLive(
	options: AvesClientOptions,
): Layer.Layer<AvesClientServices> {
	const config = AvesConfigLive(options);
	const platformHttp = httpClientLayer();
	const http = AvesHttpLive.pipe(
		Layer.provide(config),
		Layer.provide(platformHttp),
	);
	const transport = AvesTransportLive.pipe(
		Layer.provide(http),
		Layer.provide(config),
	);
	const domains = Layer.mergeAll(
		AvesBookingLive,
		AvesMasterLive,
		AvesPackagesLive,
	).pipe(Layer.provide(transport));
	return Layer.mergeAll(config, http, transport, domains);
}
