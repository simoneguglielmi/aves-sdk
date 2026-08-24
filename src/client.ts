import { Effect, ManagedRuntime } from "effect";
import { AvesBooking, type BookingClient } from "./client/booking/index.js";
import { type AvesAppServices, avesClientLayer } from "./client/layer.js";
import { AvesMaster, type MasterRecordsClient } from "./client/master/index.js";
import {
	AvesPackages,
	type PackageCatalogClient,
} from "./client/packages/index.js";
import type { AvesClientDeps } from "./client/types.js";
import { toPromiseFacade } from "./effect/run-result.js";
import type { AvesClientOptions } from "./types.js";

export { AvesConfig, AvesConfigLive } from "./client/config/index.js";
export {
	type AvesAppServices,
	AvesClientLive,
	type AvesClientServices,
	avesClientLayer,
} from "./client/layer.js";
export type { AvesClientDeps } from "./client/types.js";

/** Promise&lt;Result&gt; domains — transport stays on the Effect Layer path. */
export type AvesClientApi = {
	readonly master: MasterRecordsClient;
	readonly booking: BookingClient;
	readonly packages: PackageCatalogClient;
};

/** Compose client from Effect Layers; Promise&lt;Result&gt; only at this edge. */
export function createAvesClient(
	options: AvesClientOptions,
	deps: AvesClientDeps = {},
): AvesClientApi {
	const services = Effect.runSync(
		Effect.gen(function* () {
			return {
				master: yield* AvesMaster,
				booking: yield* AvesBooking,
				packages: yield* AvesPackages,
			};
		}).pipe(Effect.provide(avesClientLayer(options, deps))),
	);

	return {
		master: toPromiseFacade(services.master),
		booking: toPromiseFacade(services.booking),
		packages: toPromiseFacade(services.packages),
	};
}

/**
 * ManagedRuntime over {@link avesClientLayer} for Effect programs:
 * `runtime.runPromise(Effect.gen(function* () { yield* AvesBooking ... }))`.
 */
export function makeAvesRuntime(
	options: AvesClientOptions,
	deps: AvesClientDeps = {},
): ManagedRuntime.ManagedRuntime<AvesAppServices, never> {
	return ManagedRuntime.make(avesClientLayer(options, deps));
}

/**
 * AVES XML REST API client — Promise&lt;Result&gt; facade over Effect Layers.
 * Prefer {@link createAvesClient} for a plain object; this class mirrors the same API.
 */
export class AvesClient implements AvesClientApi {
	readonly master: MasterRecordsClient;
	readonly booking: BookingClient;
	readonly packages: PackageCatalogClient;

	constructor(options: AvesClientOptions, deps: AvesClientDeps = {}) {
		const client = createAvesClient(options, deps);
		this.master = client.master;
		this.booking = client.booking;
		this.packages = client.packages;
	}
}
